from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ClubCreate(BaseModel):
    name: str

class Club(BaseModel):
    id: UUID
    name: str

class PlayerCreate(BaseModel):
    name: str
    age: int
    phone: str
    club_id: UUID
    event_ids: List[UUID] = []

class Player(BaseModel):
    id: UUID
    name: str
    age: int
    phone: str
    club_id: UUID
    event_ids: List[UUID]

class EventCreate(BaseModel):
    name: str
    type: str = "knockout"
    min_rest: int = 10

class Event(BaseModel):
    id: UUID
    name: str
    type: str
    min_rest: int

class MatchCreate(BaseModel):
    event_id: UUID
    round: int
    player1_id: UUID
    player2_id: Optional[UUID] = None
    status: str = "pending"

class Match(BaseModel):
    id: UUID
    event_id: UUID
    round: int
    player1_id: UUID
    player2_id: Optional[UUID]
    court_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: str

class ScoreCreate(BaseModel):
    match_id: UUID
    player1_score: int
    player2_score: int

class Score(BaseModel):
    match_id: UUID
    player1_score: int
    player2_score: int

class MatchCodeCreate(BaseModel):
    match_id: UUID
    assigned_umpire: str

class MatchCode(BaseModel):
    match_id: UUID
    code: str
    assigned_umpire: str
    expires_at: datetime

class MatchCodeVerify(BaseModel):
    match_id: UUID
    code: str

class FixtureRequest(BaseModel):
    event_id: UUID

class ScheduleRequest(BaseModel):
    event_id: UUID
    num_courts: int = 4
    match_duration_minutes: int = 30
    start_time: datetime

class LeaderboardEntry(BaseModel):
    player_id: UUID
    player_name: str
    wins: int = 0
    losses: int = 0
    sets_won: int = 0
    sets_lost: int = 0
    points: int = 0

class CSVUploadResponse(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    inserted_count: int
    errors: List[dict]
