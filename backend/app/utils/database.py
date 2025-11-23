import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

logger = logging.getLogger(__name__)

supabase: Client = None
_supabase_configured = False

def init_supabase():
    global supabase, _supabase_configured
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not url or not key or url == "https://placeholder.supabase.co":
        logger.warning("Supabase credentials not configured. Using placeholder mode.")
        logger.warning("Please set SUPABASE_URL and SUPABASE_SERVICE_KEY to enable database functionality.")
        _supabase_configured = False
        return None
    
    try:
        supabase = create_client(url, key)
        _supabase_configured = True
        logger.info("Supabase client initialized successfully")
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        _supabase_configured = False
        return None

def get_supabase() -> Client:
    global supabase
    if supabase is None:
        supabase = init_supabase()
    if supabase is None:
        raise HTTPException(
            status_code=503,
            detail="Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables."
        )
    return supabase

def is_supabase_configured() -> bool:
    return _supabase_configured
