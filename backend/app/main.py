from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import players, clubs, events, fixtures, scheduling, match_codes, results
from app.utils.database import init_supabase, is_supabase_configured
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Tournament Management System",
    description="Production-ready knockout tournament management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(players.router, prefix="/api", tags=["players"])
app.include_router(clubs.router, prefix="/api", tags=["clubs"])
app.include_router(fixtures.router, prefix="/api", tags=["fixtures"])
app.include_router(scheduling.router, prefix="/api", tags=["scheduling"])
app.include_router(match_codes.router, prefix="/api", tags=["match_codes"])
app.include_router(results.router, prefix="/api", tags=["results"])
app.include_router(events.router, prefix="/api", tags=["events"])

@app.on_event("startup")
async def startup_event():
    init_supabase()
    if not is_supabase_configured():
        logger.warning("=" * 80)
        logger.warning("SUPABASE NOT CONFIGURED!")
        logger.warning("The API is running but database operations will fail.")
        logger.warning("Please configure SUPABASE_URL and SUPABASE_SERVICE_KEY")
        logger.warning("=" * 80)

@app.get("/")
async def root():
    return {
        "message": "Tournament Management System API",
        "status": "running",
        "version": "1.0.0",
        "database_configured": is_supabase_configured()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "configured" if is_supabase_configured() else "not_configured"
    }
