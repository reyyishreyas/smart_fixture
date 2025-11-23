from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import pandas as pd
import uuid
import io
from app.models import PlayerCreate, Player, CSVUploadResponse
from app.utils.database import get_supabase

router = APIRouter()

@router.post("/players", response_model=dict)
async def create_player(player: PlayerCreate):
    supabase = get_supabase()
    
    try:
        for event_id in player.event_ids:
            response = supabase.table("players").select("*").eq("name", player.name).in_("event_ids", [str(event_id)]).execute()
            if response.data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Player {player.name} already registered in event {event_id}"
                )
        
        club_check = supabase.table("clubs").select("*").eq("id", str(player.club_id)).execute()
        if not club_check.data:
            raise HTTPException(status_code=404, detail="Club not found")
        
        player_id = str(uuid.uuid4())
        player_data = {
            "id": player_id,
            "name": player.name,
            "age": player.age,
            "phone": player.phone,
            "club_id": str(player.club_id),
            "event_ids": [str(eid) for eid in player.event_ids]
        }
        
        result = supabase.table("players").insert(player_data).execute()
        
        return {"message": "Player created successfully", "player_id": player_id, "data": result.data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/players", response_model=List[dict])
async def get_players(event_id: str = None):
    supabase = get_supabase()
    
    try:
        if event_id:
            response = supabase.table("players").select("*").contains("event_ids", [event_id]).execute()
        else:
            response = supabase.table("players").select("*").execute()
        
        return response.data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/players/upload-csv", response_model=CSVUploadResponse)
async def upload_csv(file: UploadFile = File(...), event_id: str = None):
    supabase = get_supabase()
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be CSV format")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        required_columns = ['name', 'age', 'phone', 'club_id']
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")
        
        total_rows = len(df)
        valid_rows = 0
        invalid_rows = 0
        inserted_count = 0
        errors = []
        batch_data = []
        
        for idx, row in df.iterrows():
            try:
                if pd.isna(row['name']) or pd.isna(row['age']) or pd.isna(row['phone']) or pd.isna(row['club_id']):
                    errors.append({"row": idx + 2, "error": "Missing required fields"})
                    invalid_rows += 1
                    continue
                
                club_check = supabase.table("clubs").select("*").eq("id", str(row['club_id'])).execute()
                if not club_check.data:
                    errors.append({"row": idx + 2, "error": f"Club {row['club_id']} not found"})
                    invalid_rows += 1
                    continue
                
                player_id = str(uuid.uuid4())
                event_ids_list = [event_id] if event_id else []
                
                player_data = {
                    "id": player_id,
                    "name": str(row['name']),
                    "age": int(row['age']),
                    "phone": str(row['phone']),
                    "club_id": str(row['club_id']),
                    "event_ids": event_ids_list
                }
                
                batch_data.append(player_data)
                valid_rows += 1
                
            except Exception as e:
                errors.append({"row": idx + 2, "error": str(e)})
                invalid_rows += 1
        
        if batch_data:
            result = supabase.table("players").insert(batch_data).execute()
            inserted_count = len(result.data) if result.data else 0
        
        return CSVUploadResponse(
            total_rows=total_rows,
            valid_rows=valid_rows,
            invalid_rows=invalid_rows,
            inserted_count=inserted_count,
            errors=errors
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
