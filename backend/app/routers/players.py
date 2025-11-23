from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import csv
import uuid
from io import StringIO
from app.models import PlayerCreate, CSVUploadResponse
from app.utils.database import get_supabase

router = APIRouter()


@router.post("/players", response_model=dict)
async def create_player(player: PlayerCreate):
    supabase = get_supabase()

    try:
        # 1. Check duplicate player for each event
        for event_id in player.event_ids:
            exists = supabase.table("player_events") \
                .select("*") \
                .eq("event_id", str(event_id)) \
                .execute()

            for entry in exists.data:
                p = supabase.table("players").select("*").eq("id", entry["player_id"]).execute()
                if p.data and p.data[0]["name"].strip().lower() == player.name.strip().lower():
                    raise HTTPException(
                        status_code=400,
                        detail=f"Player '{player.name}' is already registered in event {event_id}"
                    )

        # 2. Check if club exists
        club_check = supabase.table("clubs").select("*").eq("id", str(player.club_id)).execute()
        if not club_check.data:
            raise HTTPException(status_code=404, detail="Club not found")

        # 3. Create player
        player_id = str(uuid.uuid4())
        player_data = {
            "id": player_id,
            "name": player.name.strip(),
            "age": player.age,
            "phone": player.phone.strip(),
            "club_id": str(player.club_id)
        }

        supabase.table("players").insert(player_data).execute()

        # 4. Insert into player_events
        for event_id in player.event_ids:
            supabase.table("player_events").insert({
                "player_id": player_id,
                "event_id": str(event_id)
            }).execute()

        return {
            "message": "Player created successfully",
            "player_id": player_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/players", response_model=List[dict])
async def get_players(event_id: str = None):
    supabase = get_supabase()
    try:
        if event_id:
            links = supabase.table("player_events").select("*").eq("event_id", event_id).execute()
            players = []
            for entry in links.data:
                p = supabase.table("players").select("*").eq("id", entry["player_id"]).execute()
                if p.data:
                    players.append(p.data[0])
            return players
        else:
            result = supabase.table("players").select("*").execute()
            return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/players/upload-csv", response_model=CSVUploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    supabase = get_supabase()

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be CSV format")

    try:
        content = await file.read()
        # Try multiple encodings
        for enc in ["utf-8-sig", "utf-8", "latin1"]:
            try:
                text_io = StringIO(content.decode(enc))
                break
            except UnicodeDecodeError:
                continue
        else:
            raise HTTPException(status_code=400, detail="Cannot decode CSV file. Please save as UTF-8.")

        reader = csv.DictReader(text_io)
        required_columns = ["name", "age", "phone", "club_id", "event_name"]
        for col in required_columns:
            if col not in reader.fieldnames:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")

        # Fetch events from DB
        events_res = supabase.table("events").select("*").execute()
        event_lookup = {ev["name"].strip().lower(): ev["id"] for ev in events_res.data}

        total_rows = 0
        valid_rows = 0
        invalid_rows = 0
        inserted_count = 0
        errors = []
        batch_players = []

        # Prepare all players
        for idx, row in enumerate(reader):
            total_rows += 1
            try:
                # Strip whitespace
                row = {k: (v.strip() if isinstance(v, str) else v) for k, v in row.items()}

                # Check required fields
                if any(not row.get(c) for c in required_columns):
                    errors.append({"row": idx + 2, "error": "Missing required fields"})
                    invalid_rows += 1
                    continue

                event_name = row["event_name"].lower()
                if event_name not in event_lookup:
                    errors.append({"row": idx + 2, "error": f"Event '{row['event_name']}' not found"})
                    invalid_rows += 1
                    continue

                # Check club exists
                club_check = supabase.table("clubs").select("*").eq("id", row["club_id"]).execute()
                if not club_check.data:
                    errors.append({"row": idx + 2, "error": f"Club {row['club_id']} not found"})
                    invalid_rows += 1
                    continue

                # Check duplicate in event
                existing_links = supabase.table("player_events").select("*").eq("event_id", event_lookup[event_name]).execute()
                duplicate = False
                for link in existing_links.data:
                    p = supabase.table("players").select("*").eq("id", link["player_id"]).execute()
                    if p.data and p.data[0]["name"].strip().lower() == row["name"].lower():
                        duplicate = True
                        break
                if duplicate:
                    errors.append({"row": idx + 2, "error": f"Player '{row['name']}' already registered in event '{row['event_name']}'"})
                    invalid_rows += 1
                    continue

                # Add to batch
                batch_players.append({
                    "id": str(uuid.uuid4()),
                    "name": row["name"],
                    "age": int(row["age"]),
                    "phone": row["phone"],
                    "club_id": row["club_id"],
                    "event_name": event_name  # store for mapping
                })

                valid_rows += 1

            except Exception as e:
                errors.append({"row": idx + 2, "error": str(e)})
                invalid_rows += 1

        # Insert all players first
        if batch_players:
            player_insert_data = [
                {k: v for k, v in p.items() if k != "event_name"} for p in batch_players
            ]
            result = supabase.table("players").insert(player_insert_data).execute()
            inserted_count = len(result.data)

            # Now insert player-event links
            for p in batch_players:
                try:
                    supabase.table("player_events").insert({
                        "player_id": p["id"],
                        "event_id": event_lookup[p["event_name"]]
                    }).execute()
                except Exception as e:
                    errors.append({"player": p["name"], "error": str(e)})
                    invalid_rows += 1

        return CSVUploadResponse(
            total_rows=total_rows,
            valid_rows=valid_rows,
            invalid_rows=invalid_rows,
            inserted_count=inserted_count,
            errors=errors
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
