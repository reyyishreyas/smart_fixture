from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from typing import Dict, List
from app.models import ScheduleRequest
from app.utils.database import get_supabase

router = APIRouter()

def schedule_matches_smart(matches, num_courts, match_duration_minutes, min_rest_minutes, start_time):
    courts = {f"Court-{i+1}": start_time for i in range(num_courts)}
    
    player_schedule = {}
    
    scheduled_matches = []
    
    sorted_matches = sorted(matches, key=lambda x: x['round'])
    
    for match in sorted_matches:
        if match['status'] == 'bye':
            scheduled_matches.append(match)
            continue
        
        player1_id = match['player1_id']
        player2_id = match['player2_id']
        
        earliest_court = None
        earliest_time = None
        
        for court_id, court_available_time in sorted(courts.items(), key=lambda x: x[1]):
            potential_start = court_available_time
            
            if player1_id in player_schedule:
                player1_last_end = player_schedule[player1_id]
                player1_earliest = player1_last_end + timedelta(minutes=min_rest_minutes)
                potential_start = max(potential_start, player1_earliest)
            
            if player2_id and player2_id in player_schedule:
                player2_last_end = player_schedule[player2_id]
                player2_earliest = player2_last_end + timedelta(minutes=min_rest_minutes)
                potential_start = max(potential_start, player2_earliest)
            
            if earliest_time is None or potential_start < earliest_time:
                earliest_time = potential_start
                earliest_court = court_id
        
        match_end_time = earliest_time + timedelta(minutes=match_duration_minutes)
        
        match['court_id'] = earliest_court
        match['start_time'] = earliest_time.isoformat()
        match['end_time'] = match_end_time.isoformat()
        
        courts[earliest_court] = match_end_time
        player_schedule[player1_id] = match_end_time
        if player2_id:
            player_schedule[player2_id] = match_end_time
        
        scheduled_matches.append(match)
    
    return scheduled_matches

@router.post("/schedule-matches")
async def create_schedule(request: ScheduleRequest):
    supabase = get_supabase()
    
    try:
        event_check = supabase.table("events").select("*").eq("id", str(request.event_id)).execute()
        if not event_check.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        event = event_check.data[0]
        min_rest = event.get('min_rest', 10)
        
        matches_response = supabase.table("matches").select("*").eq("event_id", str(request.event_id)).eq("status", "pending").execute()
        matches = matches_response.data
        
        if not matches:
            raise HTTPException(status_code=404, detail="No pending matches found")
        
        scheduled = schedule_matches_smart(
            matches,
            request.num_courts,
            request.match_duration_minutes,
            min_rest,
            request.start_time
        )
        
        for match in scheduled:
            if match['status'] != 'bye':
                supabase.table("matches").update({
                    "court_id": match['court_id'],
                    "start_time": match['start_time'],
                    "end_time": match['end_time']
                }).eq("id", match['id']).execute()
        
        return {
            "message": "Matches scheduled successfully",
            "total_matches": len(scheduled),
            "scheduled": scheduled
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
        
        return {
            "court_id": court_id,
            "matches": response.data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
