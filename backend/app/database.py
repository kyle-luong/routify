from sqlmodel import SQLModel, create_engine, Session
import os
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = (os.getenv("ENVIRONMENT") or "development").lower()
DATABASE_URL = os.getenv("DATABASE_URL")

def _resolve_database_url() -> str:
    if ENVIRONMENT in {"production", "prod", "ec2"}:
        if not DATABASE_URL:
            raise RuntimeError(
                "DATABASE_URL is required when ENVIRONMENT is production/ec2"
            )
        return DATABASE_URL

    return "sqlite:///./app/database.db"

DB_URL = _resolve_database_url()

connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}

engine = create_engine(DB_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)
