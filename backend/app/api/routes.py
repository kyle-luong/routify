from fastapi import APIRouter, UploadFile, File, Form
from sqlmodel import select
from hashids import Hashids
from app.database import get_session
from app.models import SessionModel, EventModel
from app.utils import parse_ics

import os
from dotenv import load_dotenv

router = APIRouter()

load_dotenv()
salt = os.environ.get("HASHID_SALT")
hashids = Hashids(min_length=6, salt=salt)

@router.post("/sessions")
async def create_session(file: UploadFile = File(...), school_location: str = Form(...)):
    content = await file.read()
    try:
        events_data = parse_ics(content.decode("utf-8"), school_location)
    except Exception as e:
        return {"error": f"Invalid file: {str(e)}"}

    if not events_data:
        return {"error": "No events found"}

    session = SessionModel()
    with get_session() as db:
        db.add(session)
        db.commit()
        db.refresh(session)

        for e in events_data:
            event = EventModel(session_id=session.id, **e)
            db.add(event)
        db.commit()

        short_id = hashids.encode(session.id)

    return {"session_id": session.uuid, "short_id": short_id}


@router.get("/sessions/{short_id}")
def get_session_events(short_id: str):
    with get_session() as db:
        try:
            real_id = hashids.decode(short_id)[0]
        except IndexError:
            return {"error": "Invalid link"}

        session = db.exec(select(SessionModel).where(SessionModel.id == real_id)).first()
        if not session:
            return {"error": "Session not found"}

        return {
            "events": [
                {
                    "title": e.title,
                    "location": e.location,
                    "start": e.start_time.strftime("%H:%M"),
                    "end": e.end_time.strftime("%H:%M"),
                    "start_date": e.start_date.isoformat(),
                    "end_date": e.end_date.isoformat(),
                    "dayOfWeek": e.day_of_week,
                    "latitude": e.latitude,
                    "longitude": e.longitude,
                }
                for e in session.events
            ]
        }
