from fastapi import APIRouter, HTTPException
from typing import List
import uuid
import random
import math
from app.models import FixtureRequest
from app.utils.database import get_supabase

router = APIRouter()

def next_power_of_two(n):
    return 2 ** math.ceil(math.log2(n))

def generate_knockout_fixtures(players, event_id):
    n = len(players)
    target_size = next_power_of_two(n)
    byes_needed = target_size - n
    
    random.shuffle(players)
    
    club_groups = {}
    for player in players:
        club_id = player['club_id']
        if club_id not in club_groups:
            club_groups[club_id] = []
        club_groups[club_id].append(player)
    
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
    
    for player in players_with_byes:
        match_id = str(uuid.uuid4())
        matches.append({
            "id": match_id,
            "event_id": str(event_id),
            "round": 1,
            "player1_id": player['id'],
            "player2_id": None,
            "status": "bye",
            "court_id": None,
            "start_time": None,
            "end_time": None
        })
    
    for i in range(0, len(players_without_byes), 2):
        if i + 1 < len(players_without_byes):
            match_id = str(uuid.uuid4())
            matches.append({
                "id": match_id,
                "event_id": str(event_id),
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
        event_check = supabase.table("events").select("*").eq("id", str(request.event_id)).execute()
        if not event_check.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        players_response = supabase.table("players").select("*").contains("event_ids", [str(request.event_id)]).execute()
        players = players_response.data
        
        if len(players) < 2:
            raise HTTPException(status_code=400, detail="At least 2 players required for tournament")
        
        matches = generate_knockout_fixtures(players, request.event_id)
        
        result = supabase.table("matches").insert(matches).execute()
        
        return {
            "message": "Fixtures generated successfully",
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
        response = supabase.table("matches").select("*").eq("event_id", event_id).order("round").execute()
        
        fixtures_by_round = {}
        for match in response.data:
            round_num = match['round']
            if round_num not in fixtures_by_round:
                fixtures_by_round[round_num] = []
            fixtures_by_round[round_num].append(match)
        
        return {
            "event_id": event_id,
            "fixtures": fixtures_by_round
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
