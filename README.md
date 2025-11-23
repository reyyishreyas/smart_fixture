**Smart_Fixture**

Smart_Fixture is an intelligent tournament management platform designed for knockout and group-stage competitions. It automates fixture generation, multi-court scheduling, real-time scoring, and secure umpire verification, ensuring fairness, scalability, and minimal administrative effort.

**Detailed Fixture Logic**

The fixture engine generates balanced knockout brackets with intelligent handling of byes, same-club avoidance, and winner progression.

Step-by-Step

Player Validation

Ensure all registered players have valid IDs, club associations, and required details (age, phone, etc.).

Bracket Size Calculation

Compute the next power of 2 greater than or equal to player count.

Example: 22 players → bracket size = 32 → 10 byes.

Player Seeding & Randomization

Shuffle all players to randomize matchups.

Apply snake seeding to distribute players across the bracket to reduce clustering of players from the same club.

Same-Club Avoidance

Scan first-round pairings:

If two players from the same club are paired, swap one with the nearest non-conflicting slot.

Ensures fairness while respecting bracket integrity.

Bye Allocation

Remaining empty slots are filled with byes.

Players receiving byes are automatically advanced to Round 2, and the system generates placeholders for their next-round matches.

Round 1 Match Creation

For each paired slot:

Create a match record with player1_id, player2_id (or null for bye), round, and event_id.

Set status = scheduled.

Auto-Progression

After match completion:

Winner is determined from scores.

Winner is automatically placed into the next-round match.

Next-round matches are created once both participants are available.

**Detailed Scheduling Logic**

The scheduling engine assigns matches to courts and times while respecting rest periods, avoiding player conflicts, and optimizing court utilization.

Steps

Court State Tracking

Each court maintains a timeline of scheduled matches.

Used to calculate earliest available start time.

Player Availability

For each player, track last scheduled match.

Enforce minimum rest: match_start_time >= last_match_end + min_rest.

Conflict Avoidance

Check that no player is scheduled in overlapping matches.

Shift matches if conflicts are detected.

Court Assignment

Select courts using “minimum idle time first”:

Identify the court that becomes free earliest.

Verify if the match can start at that time.

Assign match to the best-fit court.

Schedule Finalization

Record match with:

court_id

start_time, end_time

Ensures conflict-free, rest-compliant, multi-court schedule.

**Detailed Match-Code Flow**

Match codes ensure secure umpire verification for score submission.

Generation

Each match receives a unique 6-character alphanumeric code.

Stored in match_codes table:

match_id, code, assigned_umpire, expires_at.

Verification

Umpire submits code before scoring:

Check if code exists.

Verify it matches the stored code for that match.

Ensure the code has not expired.

Ensure match is in the correct state for scoring.

Score Submission

Upon verification:

Scores are recorded in scores table.

Match status updated to completed.

Winner automatically progresses to next round.

Auto-Progression

If both next-round participants are known:

System creates next-round match automatically.

Ensures tournament flows without manual intervention.

**Database Schema**
Table	Columns	Description
clubs	id (UUID, PK), name (TEXT)	Stores club information
players	id (UUID, PK), name, age, phone, club_id (FK), event_ids (UUID[])	Player information
events	id (UUID, PK), name, type, min_rest	Event details
matches	id (UUID, PK), event_id (FK), round, player1_id (FK), player2_id (FK), court_id, start_time, end_time, status	Stores all matches
scores	match_id (PK, FK), player1_score, player2_score	Stores match results
match_codes	match_id (PK, FK), code, assigned_umpire, expires_at	Umpire verification codes

Notes:

Relational links: players → clubs, matches → events, scores → matches, match_codes → matches.

Supports real-time updates using Supabase’s PostgreSQL features.

 Tech Stack

Backend: FastAPI + Uvicorn

Database: Supabase (PostgreSQL)

Frontend: Next.js + Tailwind CSS + TypeScript

Data Handling: Pandas (CSV), Pydantic (validation)


Smart_Fixture delivers automated, fair, and secure tournament management, combining:

Intelligent fixture generation

Optimized multi-court scheduling

Secure score submission with match codes

Dynamic leaderboards and progression logic

Perfect for clubs, schools, and professional tournaments.