# 🏆 Knockout Tournament Management System

A **production-ready**, enterprise-level tournament management platform featuring intelligent scheduling, real-time updates, and comprehensive tournament administration.

## ✨ Features

### Core Functionality
- ✅ **Player Registration** - Individual and bulk CSV upload with validation
- ✅ **Club Management** - Organize players by clubs with duplicate prevention
- ✅ **Knockout Fixtures** - Automatic bracket generation for 8-128 players
- ✅ **Same-Club Avoidance** - Smart pairing to avoid same-club matchups in early rounds
- ✅ **Automatic Bye Allocation** - Intelligent bye distribution for non-power-of-2 player counts
- ✅ **Multi-Court Scheduling** - Optimize court usage with intelligent assignment
- ✅ **Rest Time Enforcement** - Guarantee minimum 10-minute rest between player matches
- ✅ **Zero Overlap Detection** - Prevent player from having simultaneous matches
- ✅ **Umpire Match Codes** - Secure code system for match score submission
- ✅ **Live Scoring** - Real-time score updates with automatic progression
- ✅ **Dynamic Leaderboard** - Rankings by wins, sets, and points
- ✅ **Auto Progression** - Winners automatically advance to next round

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Server**: Uvicorn with auto-reload
- **Database**: Supabase (PostgreSQL)
- **Validation**: Pydantic
- **CSV Processing**: Pandas

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR + Axios
- **UI**: Responsive, modern design

### Database
- **Provider**: Supabase
- **Type**: PostgreSQL with real-time capabilities
- **Tables**: clubs, players, events, matches, scores, match_codes

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Supabase account

### 1. Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in Supabase Dashboard
3. Run the SQL schema from `backend/supabase_schema.sql`
4. Get your credentials from Project Settings → API

### 2. Backend Setup
```bash
cd backend

# Create .env file
cp .env.example .env

# Add your Supabase credentials to .env:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_key

# Dependencies are auto-installed on Replit
# Run manually: pip install -r requirements.txt

# Start the server (already configured in workflow)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend

# Create environment file
cp .env.local.example .env.local

# Update API URL if needed (default: http://localhost:8000/api)

# Dependencies are auto-installed
# Run manually: npm install

# Start the dev server (already configured in workflow)
npm run dev -- --port 5000 --hostname 0.0.0.0
```

### 4. Access the Application
- **Frontend**: http://localhost:5000 (or your Replit URL)
- **Backend API Docs**: http://localhost:8000/docs
- **Alternative API Docs**: http://localhost:8000/redoc

## 📡 API Endpoints

### Players
- `POST /api/players` - Register a player
- `GET /api/players?event_id={id}` - Get all players (optionally filtered by event)
- `POST /api/players/upload-csv` - Bulk upload players via CSV

### Clubs
- `POST /api/clubs` - Create a club
- `GET /api/clubs` - Get all clubs

### Fixtures
- `POST /api/generate-fixtures` - Generate knockout bracket
- `GET /api/fixtures/{event_id}` - Get fixtures for an event

### Scheduling
- `POST /api/schedule-matches` - Create smart multi-court schedule
- `GET /api/schedule/{court_id}` - Get schedule for specific court

### Match Codes
- `POST /api/match-code/generate` - Generate umpire access code
- `POST /api/match-code/verify` - Verify match code

### Results
- `POST /api/update-score` - Submit match score
- `GET /api/leaderboard/{event_id}` - Get tournament leaderboard

## 📊 Database Schema

```sql
clubs
├── id (UUID, PK)
└── name (TEXT)

players
├── id (UUID, PK)
├── name (TEXT)
├── age (INT)
├── phone (TEXT)
├── club_id (UUID, FK)
└── event_ids (UUID[])

events
├── id (UUID, PK)
├── name (TEXT)
├── type (TEXT)
└── min_rest (INT)

matches
├── id (UUID, PK)
├── event_id (UUID, FK)
├── round (INT)
├── player1_id (UUID, FK)
├── player2_id (UUID, FK)
├── court_id (TEXT)
├── start_time (TIMESTAMP)
├── end_time (TIMESTAMP)
└── status (TEXT)

scores
├── match_id (UUID, PK, FK)
├── player1_score (INT)
└── player2_score (INT)

match_codes
├── match_id (UUID, PK, FK)
├── code (TEXT)
├── assigned_umpire (TEXT)
└── expires_at (TIMESTAMP)
```

## 🎯 How It Works

### 1. Player Registration
- Register players individually or bulk upload via CSV
- Validate phone numbers, ages, and club associations
- Prevent duplicate registrations within the same event

### 2. Fixture Generation
- Calculates next power of 2 for bracket size
- Distributes byes to qualifying players
- Avoids same-club matchups in Round 1 where possible
- Creates all Round 1 matches in Supabase

### 3. Smart Scheduling
- Assigns matches to available courts
- Ensures 10-minute minimum rest between player matches
- Prevents overlapping matches for any player
- Optimizes court utilization to minimize idle time

### 4. Match Management
- Generates unique 6-character codes for umpires
- Verifies codes before allowing score submission
- Automatically determines winners
- Progresses winners to next round
- Creates next-round matches when all current round completes

### 5. Leaderboard
- Calculates wins, losses, sets won/lost
- Ranks by: Wins → Sets Won → Total Points
- Updates in real-time as scores are submitted

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Render/Railway)
- Push to GitHub
- Connect repository to Render/Railway
- Set environment variables
- Deploy

## 📝 CSV Upload Format

```csv
name,age,phone,club_id
John Doe,25,+1234567890,<uuid>
Jane Smith,28,+0987654321,<uuid>
```

## 🔐 Security Features
- Service key for backend Supabase operations
- Umpire match codes with expiration
- Input validation on all endpoints
- Row Level Security (RLS) support in Supabase

## 🤝 Contributing
This is a production-ready system. For modifications:
1. Test changes locally
2. Update relevant documentation
3. Ensure all workflows pass
4. Deploy to staging before production

## 📄 License
Proprietary - All rights reserved

## 🆘 Support
For issues or questions, contact the development team.

---

**Built with ❤️ for professional tournament management**
