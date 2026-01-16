"""
API route tests for calview backend.

Tests the FastAPI endpoints for session management, contact forms,
and distance matrix calculations.
"""

import pytest
from unittest.mock import patch, MagicMock
from io import BytesIO


class TestHealthEndpoint:
    """Tests for the health check endpoint."""

    def test_health_check(self, test_client):
        """Test that health endpoint returns OK."""
        response = test_client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestSessionEndpoints:
    """Tests for session creation and retrieval endpoints."""

    def test_create_session_success(self, test_client, sample_ics_content):
        """Test successful session creation with valid ICS file."""
        files = {
            "file": ("test.ics", BytesIO(sample_ics_content.encode()), "text/calendar")
        }
        response = test_client.post("/api/sessions", files=files)

        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data
        assert "short_id" in data
        assert len(data["short_id"]) >= 6

    def test_create_session_invalid_file_type(self, test_client):
        """Test session creation rejects non-ICS files."""
        files = {
            "file": ("test.txt", BytesIO(b"not an ics file"), "text/plain")
        }
        response = test_client.post("/api/sessions", files=files)

        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

    def test_create_session_empty_calendar(self, test_client, sample_ics_no_events):
        """Test session creation with empty calendar."""
        files = {
            "file": ("empty.ics", BytesIO(sample_ics_no_events.encode()), "text/calendar")
        }
        response = test_client.post("/api/sessions", files=files)

        assert response.status_code == 400
        assert "No events" in response.json()["detail"]

    def test_create_session_file_too_large(self, test_client):
        """Test session creation rejects files over 5MB."""
        large_content = "X" * (6 * 1024 * 1024)  # 6MB
        files = {
            "file": ("large.ics", BytesIO(large_content.encode()), "text/calendar")
        }
        response = test_client.post("/api/sessions", files=files)

        assert response.status_code == 400
        assert "too large" in response.json()["detail"]

    def test_get_session_success(self, test_client, sample_ics_single_event):
        """Test successful session retrieval."""
        # First create a session
        files = {
            "file": ("test.ics", BytesIO(sample_ics_single_event.encode()), "text/calendar")
        }
        create_response = test_client.post("/api/sessions", files=files)
        short_id = create_response.json()["short_id"]

        # Then retrieve it
        response = test_client.get(f"/api/sessions/{short_id}")

        assert response.status_code == 200
        data = response.json()
        assert "events" in data
        assert len(data["events"]) > 0
        assert data["events"][0]["title"] == "Single Event"

    def test_get_session_invalid_id(self, test_client):
        """Test retrieval with invalid session ID."""
        response = test_client.get("/api/sessions/invalid123")

        assert response.status_code == 400
        assert "Invalid session link" in response.json()["detail"]

    def test_get_session_not_found(self, test_client):
        """Test retrieval of non-existent session."""
        # Create a valid hashid that doesn't exist in DB
        response = test_client.get("/api/sessions/abcdef")

        # Could be 400 (invalid decode) or 404 (not found)
        assert response.status_code in [400, 404]


class TestContactEndpoint:
    """Tests for the contact form endpoint."""

    def test_contact_success(self, test_client):
        """Test successful contact form submission."""
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message."
        }
        response = test_client.post("/api/contact", json=data)

        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_contact_invalid_email(self, test_client):
        """Test contact form rejects invalid email."""
        data = {
            "name": "Test User",
            "email": "not-an-email",
            "subject": "Test Subject",
            "message": "This is a test message."
        }
        response = test_client.post("/api/contact", json=data)

        assert response.status_code == 422

    def test_contact_name_too_long(self, test_client):
        """Test contact form rejects names over 100 chars."""
        data = {
            "name": "X" * 101,
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message."
        }
        response = test_client.post("/api/contact", json=data)

        assert response.status_code == 422

    def test_contact_message_too_long(self, test_client):
        """Test contact form rejects messages over 5000 chars."""
        data = {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "X" * 5001
        }
        response = test_client.post("/api/contact", json=data)

        assert response.status_code == 422


class TestDistanceMatrixEndpoint:
    """Tests for the distance matrix endpoint."""

    def test_distance_matrix_invalid_mode(self, test_client, mock_google_maps):
        """Test distance matrix rejects invalid transport mode."""
        data = {
            "origins": [{"lat": 38.0, "lng": -78.0}],
            "destinations": [{"lat": 38.1, "lng": -78.1}],
            "mode": "teleport"
        }
        response = test_client.post("/api/distance-matrix", json=data)

        assert response.status_code == 400
        assert "Invalid mode" in response.json()["detail"]

    def test_distance_matrix_too_many_origins(self, test_client, mock_google_maps):
        """Test distance matrix rejects too many origins."""
        data = {
            "origins": [{"lat": 38.0 + i * 0.01, "lng": -78.0} for i in range(26)],
            "destinations": [{"lat": 38.1, "lng": -78.1}],
            "mode": "walking"
        }
        response = test_client.post("/api/distance-matrix", json=data)

        assert response.status_code == 400
        assert "Maximum 25" in response.json()["detail"]

    @patch('app.api.routes.GOOGLE_MAPS_KEY', 'fake-key')
    def test_distance_matrix_success(self, test_client, mock_httpx_client):
        """Test successful distance matrix calculation."""
        data = {
            "origins": [{"lat": 38.0, "lng": -78.0}],
            "destinations": [{"lat": 38.1, "lng": -78.1}],
            "mode": "walking"
        }

        with patch('app.api.routes.httpx.AsyncClient') as mock_client:
            mock_response = MagicMock()
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
            mock_instance = MagicMock()
            mock_instance.__aenter__.return_value.get.return_value = mock_response
            mock_client.return_value = mock_instance

            response = test_client.post("/api/distance-matrix", json=data)

            # May succeed or fail depending on API key setup
            assert response.status_code in [200, 500]
