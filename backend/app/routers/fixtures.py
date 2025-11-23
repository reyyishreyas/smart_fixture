from fastapi import APIRouter, HTTPException
from typing import List, Dict
import uuid
import random
import math
from app.models import FixtureRequest
from app.utils.database import get_supabase

router = APIRouter()

def next_power_of_two(n):
    return 2 ** math.ceil(math.log2(n))

def generate_knockout_fixtures(players: List[dict], event_id: str) -> List[dict]:
    n = len(players)
    target_size = next_power_of_two(n)
    byes_needed = target_size - n

    random.shuffle(players)

    # Avoid same club players clashing in first round
    club_groups = {}
    for player in players:
        club_groups.setdefault(player['club_id'], []).append(player)

    arranged_players = []
    used_clubs = set()

    for club_id, club_players in club_groups.items():
        if len(club_players) == 1:
            arranged_players.append(club_players[0])
            used_clubs.add(club_id)

    for club_id, club_players in club_groups.items():
        if club_id not in used_clubs:
            arranged_players.extend(club_players)

    matches = []
    players_with_byes = arranged_players[:byes_needed]
    players_without_byes = arranged_players[byes_needed:]

    # Create bye matches
    for player in players_with_byes:
        matches.append({
            "id": str(uuid.uuid4()),
            "event_id": event_id,
            "round": 1,
            "player1_id": player['id'],
            "player2_id": None,
            "status": "bye",
            "court_id": None,
            "start_time": None,
            "end_time": None
        })

    # Create pending matches
    for i in range(0, len(players_without_byes), 2):
        if i + 1 < len(players_without_byes):
            matches.append({
                "id": str(uuid.uuid4()),
                "event_id": event_id,
                "round": 1,
                "player1_id": players_without_byes[i]['id'],
                "player2_id": players_without_byes[i + 1]['id'],
                "status": "pending",
                "court_id": None,
                "start_time": None,
                "end_time": None
            })

    return matches

@router.post("/generate-fixtures")
async def create_fixtures(request: FixtureRequest):
    supabase = get_supabase()
    try:
        # Fetch event
        event_res = supabase.table("events").select("*").eq("id", str(request.event_id)).execute()
        if not event_res.data:
            raise HTTPException(status_code=404, detail="Event not found")
        event = event_res.data[0]

        # Fetch players linked to this event
        player_links = supabase.table("player_events").select("*").eq("event_id", str(request.event_id)).execute()
        player_ids = [link['player_id'] for link in player_links.data]

        if not player_ids:
            raise HTTPException(status_code=400, detail="No players registered for this event")

        players_res = supabase.table("players").select("*").in_("id", player_ids).execute()
        players = players_res.data

        if len(players) < 2:
            raise HTTPException(status_code=400, detail="At least 2 players required for tournament")

        # Generate fixtures
        matches = generate_knockout_fixtures(players, str(request.event_id))

        # Insert into DB
        result = supabase.table("matches").insert(matches).execute()

        return {
            "event_id": str(event['id']),
            "event_name": event['name'],
            "total_players": len(players),
            "total_matches": len(matches),
            "matches": result.data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fixtures/{event_id}")
async def get_fixtures(event_id: str):
    supabase = get_supabase()
    try:
        # Fetch event info
        event_res = supabase.table("events").select("*").eq("id", event_id).execute()
        if not event_res.data:
            raise HTTPException(status_code=404, detail="Event not found")
        event = event_res.data[0]

        # Only fetch pending or bye matches
        matches_res = supabase.table("matches").select("*").eq("event_id", event_id).in_("status", ["pending", "bye"]).order("round").execute()
        matches = matches_res.data

        # Fetch player names for each match
        player_ids = set()
        for m in matches:
            player_ids.add(m['player1_id'])
            if m.get('player2_id'):
                player_ids.add(m['player2_id'])
        players_res = supabase.table("players").select("*").in_("id", list(player_ids)).execute()
        players_lookup = {p['id']: p['name'] for p in players_res.data}

        fixtures_by_round: Dict[int, List[dict]] = {}
        for match in matches:
            round_num = match['round']
            match['player1_name'] = players_lookup.get(match['player1_id'])
            match['player2_name'] = players_lookup.get(match['player2_id'])
            fixtures_by_round.setdefault(round_num, []).append(match)

        return {
            "event_id": event_id,
            "event_name": event['name'],
            "fixtures": fixtures_by_round
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
