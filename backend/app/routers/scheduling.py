from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import List
from app.models import ScheduleRequest
from app.utils.database import get_supabase
import secrets
import string

router = APIRouter()


def generate_match_code(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def schedule_matches_smart(matches, num_courts, match_duration_minutes, min_rest_minutes, start_time):
    """
    Schedules matches smartly:
      - Zero overlapping for any player
      - Respects minimum rest time between matches
      - Optimal court utilization
    Skips BYE matches.
    """
    # Court availability
    courts = {f"Court-{i+1}": start_time for i in range(num_courts)}
    player_schedule = {}  # player_id -> last match end time
    scheduled_matches = []

    # Sort matches by round
    sorted_matches = sorted(matches, key=lambda x: x['round'])

    for match in sorted_matches:
        if match['status'] == 'bye':
            continue

        player1_id = match['player1_id']
        player2_id = match.get('player2_id')

        earliest_time = None
        assigned_court = None

        # Find earliest available court for both players
        for court_id, court_available_time in sorted(courts.items(), key=lambda x: x[1]):
            potential_start = court_available_time
            if player1_id in player_schedule:
                potential_start = max(potential_start, player_schedule[player1_id] + timedelta(minutes=min_rest_minutes))
            if player2_id and player2_id in player_schedule:
                potential_start = max(potential_start, player_schedule[player2_id] + timedelta(minutes=min_rest_minutes))

            if earliest_time is None or potential_start < earliest_time:
                earliest_time = potential_start
                assigned_court = court_id

        match_start = earliest_time
        match_end = match_start + timedelta(minutes=match_duration_minutes)

        # Update court and player schedules
        courts[assigned_court] = match_end
        player_schedule[player1_id] = match_end
        if player2_id:
            player_schedule[player2_id] = match_end

        # Assign schedule
        match['court_id'] = assigned_court
        match['start_time'] = match_start.isoformat()
        match['end_time'] = match_end.isoformat()

        scheduled_matches.append(match)

    return scheduled_matches


@router.post("/schedule-matches")
async def create_schedule(request: ScheduleRequest):
    supabase = get_supabase()
    try:
        # Fetch event
        event_res = supabase.table("events").select("*").eq("id", str(request.event_id)).execute()
        if not event_res.data:
            raise HTTPException(status_code=404, detail="Event not found")
        event = event_res.data[0]
        min_rest = event.get('min_rest', 10)  # default 10 minutes

        # Fetch pending matches
        matches_res = supabase.table("matches") \
            .select("*") \
            .eq("event_id", str(request.event_id)) \
            .eq("status", "pending") \
            .execute()
        matches = matches_res.data
        if not matches:
            raise HTTPException(status_code=404, detail="No pending matches found")

        # Fetch player names
        player_ids = set()
        for m in matches:
            player_ids.add(m['player1_id'])
            if m.get('player2_id'):
                player_ids.add(m['player2_id'])
        players_res = supabase.table("players").select("*").in_("id", list(player_ids)).execute()
        players_lookup = {p['id']: p['name'] for p in players_res.data}

        # Only unscheduled matches
        unscheduled_matches = [m for m in matches if not m.get('court_id') or not m.get('start_time')]
        scheduled_matches = schedule_matches_smart(
            unscheduled_matches,
            request.num_courts,
            request.match_duration_minutes,
            min_rest,
            request.start_time or datetime.utcnow()
        )

        # Update DB & assign match codes
        for match in scheduled_matches:
            supabase.table("matches").update({
                "court_id": match['court_id'],
                "start_time": match['start_time'],
                "end_time": match['end_time']
            }).eq("id", match['id']).execute()

            code_res = supabase.table("match_codes").select("*").eq("match_id", match['id']).execute()
            if code_res.data:
                match['match_code'] = code_res.data[0]['code']
            else:
                code = generate_match_code()
                supabase.table("match_codes").insert({
                    "match_id": match['id'],
                    "code": code,
                    "assigned_umpire": "Not Assigned",
                    "expires_at": (datetime.utcnow() + timedelta(hours=24)).isoformat()
                }).execute()
                match['match_code'] = code

        # Attach player names and match codes to all pending matches
        for m in matches:
            if m['status'] != 'pending':
                continue
            m['player1_name'] = players_lookup.get(m['player1_id'])
            m['player2_name'] = players_lookup.get(m.get('player2_id'))
            scheduled = next((s for s in scheduled_matches if s['id'] == m['id']), None)
            if scheduled:
                m['court_id'] = scheduled['court_id']
                m['start_time'] = scheduled['start_time']
                m['end_time'] = scheduled['end_time']
                m['match_code'] = scheduled['match_code']

        return {
            "event_id": str(event['id']),
            "event_name": event['name'],
            "total_matches": len(matches),
            "scheduled_matches": [m for m in matches if m['status'] == 'pending']
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schedule/{court_id}")
async def get_court_schedule(court_id: str, event_id: str = None):
    supabase = get_supabase()
    try:
        query = supabase.table("matches").select("*").eq("court_id", court_id)
        if event_id:
            query = query.eq("event_id", event_id)
        response = query.order("start_time").execute()
        matches = [m for m in response.data if m['status'] != 'bye']

        # Fetch player names
        player_ids = set()
        for m in matches:
            player_ids.add(m['player1_id'])
            if m.get('player2_id'):
                player_ids.add(m['player2_id'])
        players_res = supabase.table("players").select("*").in_("id", list(player_ids)).execute()
        players_lookup = {p['id']: p['name'] for p in players_res.data}

        # Fetch match codes
        match_ids = [m['id'] for m in matches]
        codes_res = supabase.table("match_codes").select("*").in_("match_id", match_ids).execute()
        codes_lookup = {c['match_id']: c['code'] for c in codes_res.data}

        for m in matches:
            m['player1_name'] = players_lookup.get(m['player1_id'])
            m['player2_name'] = players_lookup.get(m.get('player2_id'))
            m['match_code'] = codes_lookup.get(m['id'])

        return {
            "court_id": court_id,
            "matches": matches
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
