import logging
import os

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from sqlmodel import select
from sqlalchemy.orm import selectinload
from hashids import Hashids
from pydantic import BaseModel, EmailStr, field_validator
from typing import List
import httpx
from dotenv import load_dotenv

from app.database import get_session
from app.models import SessionModel, EventModel, ContactSubmission
from app.utils import parse_ics

logger = logging.getLogger(__name__)
router = APIRouter()

load_dotenv()
salt = os.environ.get("HASHID_SALT")
hashids = Hashids(min_length=6, salt=salt)
GOOGLE_MAPS_KEY = os.environ.get("GOOGLE_MAPS_KEY")

# Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_NAME_LENGTH = 100
MAX_SUBJECT_LENGTH = 200
MAX_MESSAGE_LENGTH = 5000


# Request/Response models
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) > MAX_NAME_LENGTH:
            raise ValueError(f'Name must be {MAX_NAME_LENGTH} characters or less')
        return v.strip()

    @field_validator('subject')
    @classmethod
    def validate_subject(cls, v):
        if len(v) > MAX_SUBJECT_LENGTH:
            raise ValueError(f'Subject must be {MAX_SUBJECT_LENGTH} characters or less')
        return v.strip()

    @field_validator('message')
    @classmethod
    def validate_message(cls, v):
        if len(v) > MAX_MESSAGE_LENGTH:
            raise ValueError(f'Message must be {MAX_MESSAGE_LENGTH} characters or less')
        return v


class LatLng(BaseModel):
    lat: float
    lng: float


class DistanceMatrixRequest(BaseModel):
    origins: List[LatLng]
    destinations: List[LatLng]
    mode: str = "walking"


@router.post("/sessions")
async def create_session(file: UploadFile = File(...), school_location: str = Form(None)):
    # Validate content type
    if file.content_type and file.content_type not in ["text/calendar", "application/octet-stream"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an ICS file.")

    # Read with size limit
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")

    try:
        events_data = parse_ics(content.decode("utf-8"), school_location)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid calendar format")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File encoding not supported")
    except Exception as e:
        logger.exception("Failed to parse ICS file")
        raise HTTPException(status_code=400, detail="Failed to parse calendar file")

    if not events_data:
        raise HTTPException(status_code=400, detail="No events found in file")

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
            raise HTTPException(status_code=400, detail="Invalid session link")

        # Eager load events to avoid N+1 queries
        stmt = select(SessionModel).where(SessionModel.id == real_id).options(selectinload(SessionModel.events))
        session = db.exec(stmt).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "events": [
                {
                    "title": e.title,
                    "location": e.location,
                    "start": e.start_time.strftime("%H:%M") if e.start_time else None,
                    "end": e.end_time.strftime("%H:%M") if e.end_time else None,
                    "start_date": e.start_date.isoformat() if e.start_date else None,
                    "end_date": e.end_date.isoformat() if e.end_date else None,
                    "dayOfWeek": e.day_of_week,
                    "latitude": e.latitude,
                    "longitude": e.longitude,
                }
                for e in session.events
            ]
        }


@router.post("/contact")
async def submit_contact(request: ContactRequest):
    """Store contact form submission."""
    submission = ContactSubmission(
        name=request.name,
        email=request.email,
        subject=request.subject,
        message=request.message,
    )

    with get_session() as db:
        db.add(submission)
        db.commit()

    return {"success": True, "message": "Thank you for your feedback!"}


@router.post("/distance-matrix")
async def get_distance_matrix(request: DistanceMatrixRequest):
    """Get travel times from Google Maps Distance Matrix API."""
    if not GOOGLE_MAPS_KEY:
        raise HTTPException(status_code=500, detail="Maps API not configured")

    if len(request.origins) > 25 or len(request.destinations) > 25:
        raise HTTPException(status_code=400, detail="Maximum 25 origins/destinations allowed")

    valid_modes = ["walking", "driving", "bicycling", "transit"]
    if request.mode not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Use: {', '.join(valid_modes)}")

    origins = "|".join(f"{o.lat},{o.lng}" for o in request.origins)
    destinations = "|".join(f"{d.lat},{d.lng}" for d in request.destinations)

    url = "https://maps.googleapis.com/maps/api/distancematrix/json"
    params = {
        "origins": origins,
        "destinations": destinations,
        "mode": request.mode,
        "key": GOOGLE_MAPS_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            data = response.json()

        if data.get("status") != "OK":
            raise HTTPException(status_code=502, detail=f"Maps API error: {data.get('status')}")

        results = []
        for i, row in enumerate(data.get("rows", [])):
            row_results = []
            for j, element in enumerate(row.get("elements", [])):
                if element.get("status") == "OK":
                    row_results.append({
                        "duration_seconds": element["duration"]["value"],
                        "duration_text": element["duration"]["text"],
                        "distance_meters": element["distance"]["value"],
                        "distance_text": element["distance"]["text"],
                    })
                else:
                    row_results.append(None)
            results.append(row_results)

        return {"results": results}

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timeout. Please try again.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Distance matrix API error")
        raise HTTPException(status_code=500, detail="Failed to calculate travel times")
