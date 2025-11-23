from fastapi import APIRouter, HTTPException
from typing import List
import uuid
from app.models import EventCreate, Event
from app.utils.database import get_supabase

router = APIRouter()

@router.post("/events", response_model=Event)
async def create_event(event: EventCreate):
    """
    Create a new event.
    """
    supabase = get_supabase()
    try:
        event_id = str(uuid.uuid4())
        data = {
            "id": event_id,
            "name": event.name,
            "type": event.type,
            "min_rest": event.min_rest
        }
        supabase.table("events").insert(data).execute()
        return {**data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events", response_model=List[Event])
async def get_events():
    """
    List all events.
    """
    supabase = get_supabase()
    try:
        result = supabase.table("events").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    """
    Get a single event by ID.
    """
    supabase = get_supabase()
    try:
        result = supabase.table("events").select("*").eq("id", event_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
