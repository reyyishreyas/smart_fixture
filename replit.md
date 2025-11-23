# Knockout Tournament Management System

## Overview
A production-ready, enterprise-level tournament management system built with FastAPI (backend) and Next.js (frontend), integrated with Supabase (PostgreSQL) for real-time data management.

## Current State
- **Status**: Backend and Frontend structure complete
- **Backend**: FastAPI running on port 8000
- **Frontend**: Next.js running on port 5000
- **Database**: Awaiting Supabase credentials configuration

## Recent Changes (Nov 23, 2025)
- ✅ Initialized Python FastAPI backend with all routers
- ✅ Created Supabase database schema (SQL file provided)
- ✅ Implemented all backend modules:
  - Player & Club registration with CSV upload
  - Knockout fixture generation with bye allocation
  - Smart multi-court scheduling engine
  - Umpire match code system
  - Live scoring and automatic progression
  - Dynamic leaderboard
- ✅ Initialized Next.js frontend with Tailwind CSS
- ✅ Created professional dashboard homepage
- ✅ Configured workflows for both backend and frontend
- ⏳ Awaiting Supabase credentials from user

## Project Architecture

### Backend (Python FastAPI)
```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── models.py               # Pydantic models
│   ├── routers/                # API endpoints
│   │   ├── players.py          # Player registration & CSV upload
│   │   ├── clubs.py            # Club management
│   │   ├── fixtures.py         # Knockout fixture generation
│   │   ├── scheduling.py       # Smart multi-court scheduling
│   │   ├── match_codes.py      # Umpire code system
│   │   └── results.py          # Scoring & leaderboard
│   └── utils/
│       └── database.py         # Supabase client configuration
├── supabase_schema.sql         # Complete database schema
├── .env.example                # Environment variables template
└── requirements.txt (auto)     # Python dependencies
```

### Frontend (Next.js + Tailwind)
```
frontend/
├── app/
│   ├── page.tsx                # Dashboard homepage
│   ├── players/                # Player registration pages
│   ├── clubs/                  # Club management pages
│   ├── fixtures/               # Fixture bracket viewer
│   ├── schedule/               # Court scheduling viewer
│   ├── match/                  # Match scoring pages
│   └── leaderboard/            # Leaderboard display
├── lib/
│   └── api.ts                  # API client configuration
├── components/                 # Reusable React components
└── .env.local.example          # Frontend environment template
```

### Database (Supabase)
Tables: `clubs`, `players`, `events`, `matches`, `scores`, `match_codes`

## Key Features Implemented
1. **Player Management**: Registration with validation, duplicate prevention, CSV bulk upload
2. **Knockout Fixtures**: Automatic generation for 8-128 players with same-club avoidance
3. **Smart Scheduling**: Multi-court assignment with 10-min rest enforcement and zero overlap
4. **Umpire Codes**: Secure match code generation and verification
5. **Live Results**: Score submission with automatic winner progression to next rounds
6. **Leaderboard**: Dynamic ranking by wins → sets → points

## Configuration Required
### Supabase Setup
1. Create Supabase project at https://supabase.com
2. Run `backend/supabase_schema.sql` in Supabase SQL Editor
3. Get credentials from Project Settings > API
4. Set environment variables (see below)

### Environment Variables
**Backend (.env)**:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Running the Application
Both workflows are configured and auto-start:
- **Backend**: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- **Frontend**: `npm run dev -- --port 5000 --hostname 0.0.0.0`

## Next Steps
1. Obtain Supabase credentials from user
2. Configure environment variables
3. Test all API endpoints with real Supabase data
4. Build remaining frontend pages (players, fixtures, schedule, etc.)
5. Implement real-time updates
6. Deploy to production (Vercel + Render/Railway)

## User Preferences
- No mock data - all operations use real Supabase integration
- Professional, market-ready UI design
- Production-ready code with proper error handling
- Full TypeScript for frontend
- Clean, scalable architecture

## Technology Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn, Supabase Python Client, Pandas
- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS, SWR/Axios
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Frontend), Render/Railway (Backend)
