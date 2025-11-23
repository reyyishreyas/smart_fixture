# Tournament Management System - Backend

Production-ready FastAPI backend for knockout tournament management.

## Features

- Player registration with CSV bulk upload
- Club management
- Knockout fixture generation (8-128 players)
- Smart multi-court scheduling with rest time enforcement
- Umpire match code system
- Live score tracking and automatic progression
- Dynamic leaderboard

## Setup

1. Install dependencies (already done via Replit):
   ```bash
   # Dependencies are auto-installed
   ```

2. Set up Supabase:
   - Create a Supabase project at https://supabase.com
   - Run the SQL schema in `supabase_schema.sql` in your Supabase SQL Editor
   - Get your credentials from Project Settings > API

3. Configure environment variables in `.env`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

4. Run the server:
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

### Players
- `POST /api/players` - Register a player
- `GET /api/players` - Get all players
- `POST /api/players/upload-csv` - Bulk upload via CSV

### Clubs
- `POST /api/clubs` - Create a club
- `GET /api/clubs` - Get all clubs

### Fixtures
- `POST /api/generate-fixtures` - Generate knockout fixtures
- `GET /api/fixtures/{event_id}` - Get fixtures for event

### Scheduling
- `POST /api/schedule-matches` - Create smart schedule
- `GET /api/schedule/{court_id}` - Get court schedule

### Match Codes
- `POST /api/match-code/generate` - Generate umpire code
- `POST /api/match-code/verify` - Verify match code

### Results
- `POST /api/update-score` - Submit match score
- `GET /api/leaderboard/{event_id}` - Get leaderboard

## Documentation

Visit `/docs` for interactive API documentation (Swagger UI)
Visit `/redoc` for alternative API documentation
