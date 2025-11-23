from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import uuid
import secrets
import string
from app.models import MatchCodeCreate, MatchCodeVerify
from app.utils.database import get_supabase

router = APIRouter()

def generate_match_code(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@router.post("/match-code/generate")
async def create_match_code(request: MatchCodeCreate):
    supabase = get_supabase()
    
    try:
        match_check = supabase.table("matches").select("*").eq("id", str(request.match_id)).execute()
        if not match_check.data:
            raise HTTPException(status_code=404, detail="Match not found")
        
        existing_code = supabase.table("match_codes").select("*").eq("match_id", str(request.match_id)).execute()
        if existing_code.data:
            return {
                "message": "Match code already exists",
                "code": existing_code.data[0]['code'],
                "match_id": str(request.match_id)
            }
        
        code = generate_match_code()
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        code_data = {
            "match_id": str(request.match_id),
            "code": code,
            "assigned_umpire": request.assigned_umpire,
            "expires_at": expires_at.isoformat()
        }
        
        result = supabase.table("match_codes").insert(code_data).execute()
        
        return {
            "message": "Match code generated successfully",
            "code": code,
            "match_id": str(request.match_id),
            "expires_at": expires_at.isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/match-code/verify")
async def verify_match_code(request: MatchCodeVerify):
    supabase = get_supabase()
    
    try:
        code_check = supabase.table("match_codes").select("*").eq("match_id", str(request.match_id)).eq("code", request.code).execute()
        
        if not code_check.data:
            raise HTTPException(status_code=404, detail="Invalid match code")
        
        code_data = code_check.data[0]
        expires_at = datetime.fromisoformat(code_data['expires_at'].replace('Z', '+00:00'))
        
        if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
            raise HTTPException(status_code=400, detail="Match code has expired")
        
        return {
            "valid": True,
            "match_id": str(request.match_id),
            "assigned_umpire": code_data['assigned_umpire']
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
