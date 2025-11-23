from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from app.models import ScoreCreate
from app.utils.database import get_supabase

router = APIRouter()

@router.post("/update-score")
async def update_score(score: ScoreCreate):
    supabase = get_supabase()
    
    try:
        match_check = supabase.table("matches").select("*").eq("id", str(score.match_id)).execute()
        if not match_check.data:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match = match_check.data[0]
        
        score_data = {
            "match_id": str(score.match_id),
            "player1_score": score.player1_score,
            "player2_score": score.player2_score
        }
        
        existing_score = supabase.table("scores").select("*").eq("match_id", str(score.match_id)).execute()
        
        if existing_score.data:
            supabase.table("scores").update(score_data).eq("match_id", str(score.match_id)).execute()
        else:
            supabase.table("scores").insert(score_data).execute()
        
        winner_id = match['player1_id'] if score.player1_score > score.player2_score else match['player2_id']
        
        supabase.table("matches").update({"status": "completed"}).eq("id", str(score.match_id)).execute()
        
        # Handle next round matches
        next_round = match['round'] + 1
        next_round_matches = supabase.table("matches").select("*").eq("event_id", match['event_id']).eq("round", next_round).execute()
        
        if not next_round_matches.data:
            total_completed = supabase.table("matches").select("*").eq("event_id", match['event_id']).eq("round", match['round']).eq("status", "completed").execute()
            
            if total_completed.data:
                winners = []
                for completed_match in total_completed.data:
                    match_score = supabase.table("scores").select("*").eq("match_id", completed_match['id']).execute()
                    if match_score.data:
                        sc = match_score.data[0]
                        w_id = completed_match['player1_id'] if sc['player1_score'] > sc['player2_score'] else completed_match['player2_id']
                        winners.append(w_id)
                
                bye_winners = supabase.table("matches").select("*").eq("event_id", match['event_id']).eq("round", match['round']).eq("status", "bye").execute()
                for bye_match in bye_winners.data:
                    winners.append(bye_match['player1_id'])
                
                if len(winners) > 1:
                    next_matches = []
                    for i in range(0, len(winners), 2):
                        if i + 1 < len(winners):
                            next_match = {
                                "id": str(uuid.uuid4()),
                                "event_id": match['event_id'],
                                "round": next_round,
                                "player1_id": winners[i],
                                "player2_id": winners[i + 1],
                                "status": "pending",
                                "court_id": None,
                                "start_time": None,
                                "end_time": None
                            }
                            next_matches.append(next_match)
                    
                    if next_matches:
                        supabase.table("matches").insert(next_matches).execute()
        
        return {
            "message": "Score updated successfully",
            "winner_id": winner_id,
            "match_completed": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard")
async def get_latest_leaderboard():
    """
    Returns the leaderboard for the latest event automatically.
    """
    supabase = get_supabase()
    
    try:
        # Fetch latest event
        events_res = supabase.table("events").select("*").order("created_at", desc=True).limit(1).execute()
        if not events_res.data:
            raise HTTPException(status_code=404, detail="No events found")
        latest_event = events_res.data[0]

        event_id = latest_event["id"]

        matches = supabase.table("matches").select("*").eq("event_id", event_id).eq("status", "completed").execute()
        
        player_stats = {}
        
        for match in matches.data:
            score_data = supabase.table("scores").select("*").eq("match_id", match['id']).execute()
            
            if score_data.data:
                score = score_data.data[0]
                p1_id = match['player1_id']
                p2_id = match['player2_id']
                
                if p1_id not in player_stats:
                    player_stats[p1_id] = {"wins": 0, "losses": 0, "sets_won": 0, "sets_lost": 0, "points": 0}
                if p2_id not in player_stats:
                    player_stats[p2_id] = {"wins": 0, "losses": 0, "sets_won": 0, "sets_lost": 0, "points": 0}
                
                if score['player1_score'] > score['player2_score']:
                    player_stats[p1_id]["wins"] += 1
                    player_stats[p2_id]["losses"] += 1
                else:
                    player_stats[p2_id]["wins"] += 1
                    player_stats[p1_id]["losses"] += 1
                
                player_stats[p1_id]["sets_won"] += score['player1_score']
                player_stats[p1_id]["sets_lost"] += score['player2_score']
                player_stats[p2_id]["sets_won"] += score['player2_score']
                player_stats[p2_id]["sets_lost"] += score['player1_score']
                
                player_stats[p1_id]["points"] = player_stats[p1_id]["wins"] * 3 + player_stats[p1_id]["sets_won"]
                player_stats[p2_id]["points"] = player_stats[p2_id]["wins"] * 3 + player_stats[p2_id]["sets_won"]
        
        leaderboard = []
        for player_id, stats in player_stats.items():
            player_data = supabase.table("players").select("*").eq("id", player_id).execute()
            player_name = player_data.data[0]['name'] if player_data.data else "Unknown"
            
            leaderboard.append({
                "player_id": player_id,
                "player_name": player_name,
                "wins": stats["wins"],
                "losses": stats["losses"],
                "sets_won": stats["sets_won"],
                "sets_lost": stats["sets_lost"],
                "points": stats["points"]
            })
        
        leaderboard.sort(key=lambda x: (x["wins"], x["sets_won"], x["points"]), reverse=True)
        
        return {
            "event_id": event_id,
            "event_name": latest_event["name"],
            "leaderboard": leaderboard
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
