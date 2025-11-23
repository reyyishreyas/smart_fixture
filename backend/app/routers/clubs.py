from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from app.models import ClubCreate, Club
from app.utils.database import get_supabase

router = APIRouter()

@router.post("/clubs", response_model=dict)
async def create_club(club: ClubCreate):
    supabase = get_supabase()
    
    try:
        existing = supabase.table("clubs").select("*").eq("name", club.name).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail=f"Club '{club.name}' already exists")
        
        club_id = str(uuid.uuid4())
        club_data = {
            "id": club_id,
            "name": club.name
        }
        
        result = supabase.table("clubs").insert(club_data).execute()
        
        return {"message": "Club created successfully", "club_id": club_id, "data": result.data}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clubs", response_model=List[dict])
async def get_clubs():
    supabase = get_supabase()
    
    try:
        response = supabase.table("clubs").select("*").execute()
        return response.data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
