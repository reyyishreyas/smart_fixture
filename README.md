# Smart Fixture

**Smart Fixture** is a comprehensive tournament management system that intelligently generates fixtures, schedules matches, and secures score submissions through automated match codes. It is designed to handle knockout tournaments efficiently while respecting club affiliations, player rest periods, and court availability.  

[Live Application](https://smart-fixture.vercel.app/)

[Watch Demo Video]([https://drive.google.com/drive/folders/1HMugOr4Xqke8dkWmtqixS5ahpT7zdj1Y?usp=sharing]
https://drive.google.com/drive/folders/1HMugOr4Xqke8dkWmtqixS5ahpT7zdj1Y?usp=sharing 
this web application is compatible for all kind of devices 


## Table of Contents

1. [Fixture Logic](#fixture-logic)  
2. [Scheduling Logic](#scheduling-logic)  
3. [Match-Code Flow & Security](#match-code-flow--security)  
4. [Database Schema](#database-schema)  
5. [Player Registration Flow](#player-registration-flow)  
6. [Fixture Generation Flow](#fixture-generation-flow)  
7. [Smart Scheduling Flow](#smart-scheduling-flow)  
8. [Match-Code Verification Flow](#match-code-verification-flow)  

---

## 1. Fixture Logic

The fixture engine generates balanced knockout brackets while handling **byes**, **same-club conflicts**, and **automatic winner progression**.  

### Step-by-Step Logic

1. **Player Validation**  
   - Each player must have a **unique ID**, **club association**, and required personal details.  

2. **Bracket Size Calculation**  
   - Compute the next power of 2 ≥ number of players.  
   - Example: 22 players → bracket size 32 → 10 byes.  

3. **Seeding & Randomization**  
   - Players are shuffled and assigned using **snake seeding** to avoid clustering players from the same club.  

4. **Same-Club Avoidance**  
   - First-round pairings are scanned and swapped to resolve conflicts.  

5. **Bye Allocation**  
   - Empty slots become **byes**, and players automatically advance.  

6. **Match Creation & Auto-Progression**  
   - Matches are created with `player1_id`, `player2_id`, `round`, and `event_id`.  
   - Winners auto-advance to the next round.  

### Simplified Diagram
<img width="323" height="326" alt="Screenshot 2025-11-23 at 11 47 25 PM" src="https://github.com/user-attachments/assets/66471b54-7465-4588-9ef0-03ea9a80a547" />


## 2. Scheduling Logic

The scheduling engine assigns matches to **courts** and **times** while ensuring rest periods and avoiding conflicts.  

### Steps

1. **Court State Tracking**  
   - Each court maintains its scheduled matches to determine earliest availability.  

2. **Player Availability**  
   - Tracks last match for each player to enforce minimum rest time.  

3. **Conflict Avoidance**  
   - Ensures no overlapping matches; shifts matches if required.  

4. **Court Assignment**  
   - Assigns matches to courts minimizing idle time.  

5. **Schedule Finalization**  
   - Stores `court_id`, `start_time`, and `end_time` for each match.  

### Simplified Flowchart
<img width="309" height="236" alt="Screenshot 2025-11-23 at 11 48 03 PM" src="https://github.com/user-attachments/assets/4ae238cd-4c43-481e-9ef4-7d506d61b403" />

## 3. Match-Code Flow & Security

Ensures **secure umpire verification** for score submission.  

### Steps

1. **Generation**  
   - Each match receives a unique **6-character alphanumeric code**, stored with `assigned_umpire` and `expires_at`.  

2. **Verification**  
   - Umpire submits code → system checks validity, match state, and expiry.  

3. **Score Submission**  
   - Verified codes allow score recording; match status updates to completed.  

4. **Auto-Progression**  
   - Winners automatically advance to the next round.  

### Diagram
<img width="352" height="240" alt="Screenshot 2025-11-23 at 11 49 02 PM" src="https://github.com/user-attachments/assets/6d2c2025-85cc-4428-9ef4-e33dfb80c296" />


## 4. Database Schema

### Key Tables
- **players**: `id`, `name`, `club_id`, `age`, `unique_player_id`  
- **clubs**: `id`, `name`  
- **matches**: `id`, `player1_id`, `player2_id`, `round`, `event_id`, `court_id`, `start_time`, `end_time`, `status`  
- **match_codes**: `match_id`, `code`, `assigned_umpire`, `expires_at`  
- **scores**: `match_id`, `player1_score`, `player2_score`, `winner_id`  
- **courts**: `id`, `name`, `location`  

### Relationships
- Each **player** belongs to a **club**  
- Each **match** has two players  
- Each **match code** links to a match and umpire  
- Each **court** is assigned per match  

---

## 5. Player Registration Flow

**Key Logic (`players.py`)**:  
1. Player enters **name, age, phone, club, and event IDs**.  
2. For each event:  
   - Check duplicates → reject if exists  
   - Validate club → reject if not exists  
   - Assign UUID → insert into `players` table  
   - Map player to event → insert into `player_events` table  
3. **Supports CSV bulk upload** with validation and error reporting  

### Flowchart
<img width="369" height="346" alt="Screenshot 2025-11-23 at 11 49 31 PM" src="https://github.com/user-attachments/assets/6551f7d7-920f-485f-a0d7-5c26ae534391" />

## 6. Fixture Generation Flow

**Key Logic (`fixtures.py`)**:  
- Fetch registered players for the event  
- Compute next power of 2 → determine byes  
- Shuffle players → avoid same-club first-round clashes  
- Assign byes → create matches in `matches` table  

### Flowchart
<img width="340" height="334" alt="Screenshot 2025-11-23 at 11 49 55 PM" src="https://github.com/user-attachments/assets/aa314658-7235-4355-b40b-56f8c228a513" />


## 7. Smart Scheduling Flow

**Key Logic (`scheduling.py`)**:  
- Skip bye matches  
- For each match:  
  - Check player availability & rest  
  - Check court availability  
  - Assign court, start & end time  
- Update DB and generate match codes  

### Flowchart
<img width="368" height="332" alt="Screenshot 2025-11-23 at 11 50 36 PM" src="https://github.com/user-attachments/assets/777b743a-4e2c-438b-9716-bb0fa89e5e24" />

## 8. Match-Code Verification Flow

**Key Logic (`match_codes.py`)**:  
- Umpire submits `match_id + code`  
- Verify:  
  - Match exists?  
  - Code valid & not expired?  
- If valid → allow score submission  
- If invalid → reject  

### Flowchart
<img width="448" height="229" alt="Screenshot 2025-11-23 at 11 50 59 PM" src="https://github.com/user-attachments/assets/2a97b083-15f0-4029-b32d-39042fc9df49" />

### Backend Source

All core logic lives in the `backend` folder of this [GitHub Repository](https://github.com/reyyishreyas/smart_fixture).
