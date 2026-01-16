"""
Pytest configuration and fixtures for calview backend tests.

This module provides shared fixtures for testing the FastAPI backend,
including database setup, mock clients, and sample data.
"""

import sys
import os
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from contextlib import contextmanager

import pytest
from sqlmodel import SQLModel, create_engine, Session
from fastapi.testclient import TestClient

# Add the backend directory to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///./test.db"


@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine using in-memory SQLite."""
    engine = create_engine(
        TEST_DATABASE_URL
    )
    # Import models to register them
    from app.models import SessionModel, EventModel, ContactSubmission
    SQLModel.metadata.create_all(engine)
    return engine


@pytest.fixture
def test_db_session(test_engine):
    """Provide a database session for testing with rollback after each test."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def mock_db_session(test_engine, monkeypatch):
    """
    Mock the get_session function to use test database.
    """
    from app.models import SessionModel, EventModel, ContactSubmission
    SQLModel.metadata.create_all(test_engine)

    @contextmanager
    def mock_get_session():
        session = Session(test_engine)
        try:
            yield session
        finally:
            session.close()

    monkeypatch.setattr("app.database.get_session", mock_get_session)
    monkeypatch.setattr("app.api.routes.get_session", mock_get_session)

    return test_engine


@pytest.fixture
def mock_google_maps():
    """
    Mock Google Maps client for geocoding operations.
    """
    mock_response = [{
        'geometry': {
            'location': {'lat': 38.0293, 'lng': -78.4767},
            'location_type': 'ROOFTOP'
        },
        'types': ['establishment', 'university'],
        'formatted_address': 'University of Virginia, Charlottesville, VA'
    }]

    with patch('app.utils.gmaps') as mock_gmaps:
        mock_gmaps.geocode.return_value = mock_response
        yield mock_gmaps


@pytest.fixture
def test_client(mock_db_session, mock_google_maps):
    """
    Provide a FastAPI TestClient with mocked dependencies.
    """
    os.environ.setdefault("HASHID_SALT", "test-salt-for-testing")
    os.environ.setdefault("GOOGLE_MAPS_KEY", "fake-test-key")
    os.environ.setdefault("TESTING", "true")

    from app.main import app

    with TestClient(app) as client:
        yield client


@pytest.fixture
def mock_google_maps_empty():
    """Mock Google Maps client that returns no results."""
    with patch('app.utils.gmaps') as mock_gmaps:
        mock_gmaps.geocode.return_value = []
        yield mock_gmaps


@pytest.fixture
def mock_google_maps_error():
    """Mock Google Maps client that raises an exception."""
    with patch('app.utils.gmaps') as mock_gmaps:
        mock_gmaps.geocode.side_effect = Exception("API Error")
        yield mock_gmaps


@pytest.fixture
def sample_ics_content():
    """Sample ICS calendar content for testing."""
    return """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20240115T100000
DTEND:20240115T110000
SUMMARY:Math 101
LOCATION:Room 101
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20240215T235959
UID:test-event-1
END:VEVENT
BEGIN:VEVENT
DTSTART:20240116T140000
DTEND:20240116T153000
SUMMARY:Physics Lab
LOCATION:Science Building Room 201
UID:test-event-2
END:VEVENT
BEGIN:VEVENT
DTSTART:20240117T090000
DTEND:20240117T103000
SUMMARY:Online Meeting
LOCATION:
UID:test-event-3
END:VEVENT
END:VCALENDAR"""


@pytest.fixture
def sample_ics_single_event():
    """Sample ICS with a single non-recurring event."""
    return """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20240115T100000
DTEND:20240115T110000
SUMMARY:Single Event
LOCATION:Test Building
UID:test-single
END:VEVENT
END:VCALENDAR"""


@pytest.fixture
def sample_ics_no_events():
    """Sample ICS with no events."""
    return """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
END:VCALENDAR"""


@pytest.fixture
def mock_httpx_client():
    """Mock httpx.AsyncClient for distance matrix API tests."""
    mock_response = Mock()
    mock_response.json.return_value = {
        "status": "OK",
        "rows": [{
            "elements": [{
                "status": "OK",
                "duration": {"value": 600, "text": "10 mins"},
                "distance": {"value": 1000, "text": "1.0 km"}
            }]
        }]
    }

    with patch('httpx.AsyncClient') as mock_client:
        mock_instance = MagicMock()
        mock_instance.__aenter__.return_value.get.return_value = mock_response
        mock_client.return_value = mock_instance
        yield mock_client
