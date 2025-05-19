from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.types import JSON
from typing import List, Optional
from datetime import date, time
import uuid

class SessionModel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), index=True)
    created_at: Optional[date] = Field(default_factory=date.today)
    events: List["EventModel"] = Relationship(back_populates="session")


class EventModel(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="sessionmodel.id")
    session: Optional[SessionModel] = Relationship(back_populates="events")

    title: str
    location: str
    start_time: Optional[time]
    end_time: Optional[time]
    start_date: Optional[date]
    end_date: Optional[date]

    day_of_week: Optional[List[str]] = Field(default_factory=list, sa_column=Column(JSON))

    latitude: Optional[float]
    longitude: Optional[float]
