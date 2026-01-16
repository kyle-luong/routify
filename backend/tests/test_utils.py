"""
Unit tests for calview backend utility functions.

Tests the ICS parsing, geocoding, and location clustering logic.
"""

import pytest
from unittest.mock import patch
from datetime import date, time


class TestExpandAbbreviations:
    """Tests for the expand_abbreviations function."""

    def test_expand_building(self):
        """Test expanding 'Bldg' to 'Building'."""
        from app.utils import expand_abbreviations
        result = expand_abbreviations("Science Bldg")
        assert "Building" in result

    def test_expand_multiple(self):
        """Test expanding multiple abbreviations."""
        from app.utils import expand_abbreviations
        result = expand_abbreviations("Eng Bldg Rm 101")
        assert "Engineering" in result
        assert "Building" in result
        assert "Room" in result

    def test_no_abbreviations(self):
        """Test text without abbreviations passes through."""
        from app.utils import expand_abbreviations
        result = expand_abbreviations("Regular Building Name")
        assert result == "Regular Building Name"


class TestCleanLocation:
    """Tests for the clean_location function."""

    def test_clean_trailing_numbers(self):
        """Test removing trailing room numbers."""
        from app.utils import clean_location
        result = clean_location("Building A 123")
        assert not result.endswith("123")

    def test_clean_empty_string(self):
        """Test empty string returns empty."""
        from app.utils import clean_location
        result = clean_location("")
        assert result == ""

    def test_clean_none(self):
        """Test None returns empty string."""
        from app.utils import clean_location
        result = clean_location(None)
        assert result == ""


class TestHaversineDistance:
    """Tests for the haversine_distance function."""

    def test_same_point(self):
        """Test distance to same point is zero."""
        from app.utils import haversine_distance
        result = haversine_distance(38.0, -78.0, 38.0, -78.0)
        assert result == 0.0

    def test_known_distance(self):
        """Test known distance calculation."""
        from app.utils import haversine_distance
        # NYC to LA is approximately 3940 km
        result = haversine_distance(40.7128, -74.0060, 34.0522, -118.2437)
        assert 3900 < result < 4000


class TestCalculateConfidence:
    """Tests for the calculate_confidence function."""

    def test_high_confidence_rooftop(self):
        """Test ROOFTOP location type gives high confidence."""
        from app.utils import calculate_confidence
        result = {
            "geometry": {"location_type": "ROOFTOP"},
            "types": ["establishment"],
            "formatted_address": "Test University"
        }
        score = calculate_confidence(result)
        assert score > 0.8

    def test_low_confidence_approximate(self):
        """Test APPROXIMATE location type gives lower confidence."""
        from app.utils import calculate_confidence
        result = {
            "geometry": {"location_type": "APPROXIMATE"},
            "types": [],
            "formatted_address": "Unknown"
        }
        score = calculate_confidence(result)
        assert score < 0.7


class TestClusterLocations:
    """Tests for the cluster_locations function."""

    def test_single_location(self):
        """Test clustering with single location."""
        from app.utils import cluster_locations
        geocoded = {
            "loc1": {"lat": 38.0, "lng": -78.0, "confidence": 0.9}
        }
        result = cluster_locations(geocoded)
        assert result["lat"] == 38.0
        assert result["lng"] == -78.0

    def test_empty_locations(self):
        """Test clustering with no locations."""
        from app.utils import cluster_locations
        result = cluster_locations({})
        assert result is None

    def test_multiple_locations_median(self):
        """Test clustering uses median for multiple locations."""
        from app.utils import cluster_locations
        geocoded = {
            "loc1": {"lat": 38.0, "lng": -78.0, "confidence": 0.9},
            "loc2": {"lat": 39.0, "lng": -79.0, "confidence": 0.9},
            "loc3": {"lat": 40.0, "lng": -80.0, "confidence": 0.9},
        }
        result = cluster_locations(geocoded)
        assert result["lat"] == 39.0
        assert result["lng"] == -79.0


class TestFindOutliers:
    """Tests for the find_outliers function."""

    def test_no_outliers(self):
        """Test no outliers when all locations are close."""
        from app.utils import find_outliers
        geocoded = {
            "loc1": {"lat": 38.0, "lng": -78.0},
            "loc2": {"lat": 38.01, "lng": -78.01},
        }
        centroid = {"lat": 38.005, "lng": -78.005}
        result = find_outliers(geocoded, centroid)
        assert len(result) == 0

    def test_detects_outlier(self):
        """Test detects outlier far from centroid."""
        from app.utils import find_outliers
        geocoded = {
            "loc1": {"lat": 38.0, "lng": -78.0},
            "far": {"lat": 45.0, "lng": -85.0},  # Very far away
        }
        centroid = {"lat": 38.0, "lng": -78.0}
        result = find_outliers(geocoded, centroid)
        assert "far" in result


class TestParseIcs:
    """Tests for the parse_ics function."""

    @patch('app.utils.gmaps')
    def test_parse_basic_event(self, mock_gmaps, sample_ics_single_event):
        """Test parsing a basic single event."""
        mock_gmaps.geocode.return_value = [{
            'geometry': {
                'location': {'lat': 38.0293, 'lng': -78.4767},
                'location_type': 'ROOFTOP'
            },
            'types': ['establishment'],
            'formatted_address': 'Test Building'
        }]

        from app.utils import parse_ics
        events = parse_ics(sample_ics_single_event)

        assert len(events) > 0
        assert events[0]['title'] == 'Single Event'

    @patch('app.utils.gmaps')
    def test_parse_recurring_event(self, mock_gmaps, sample_ics_content):
        """Test parsing recurring events expands correctly."""
        mock_gmaps.geocode.return_value = [{
            'geometry': {
                'location': {'lat': 38.0293, 'lng': -78.4767},
                'location_type': 'ROOFTOP'
            },
            'types': ['establishment'],
            'formatted_address': 'Room 101'
        }]

        from app.utils import parse_ics
        events = parse_ics(sample_ics_content)

        # Should have multiple instances of Math 101
        math_events = [e for e in events if e['title'] == 'Math 101']
        assert len(math_events) > 1

    @patch('app.utils.gmaps')
    def test_parse_empty_location(self, mock_gmaps, sample_ics_content):
        """Test events with empty location have None coordinates."""
        mock_gmaps.geocode.return_value = []

        from app.utils import parse_ics
        events = parse_ics(sample_ics_content)

        # Online Meeting has empty location
        online_events = [e for e in events if e['title'] == 'Online Meeting']
        assert len(online_events) > 0
        assert online_events[0]['latitude'] is None

    @patch('app.utils.gmaps')
    def test_event_structure(self, mock_gmaps, sample_ics_single_event):
        """Test parsed events have correct structure."""
        mock_gmaps.geocode.return_value = [{
            'geometry': {
                'location': {'lat': 38.0293, 'lng': -78.4767},
                'location_type': 'ROOFTOP'
            },
            'types': ['establishment'],
            'formatted_address': 'Test Building'
        }]

        from app.utils import parse_ics
        events = parse_ics(sample_ics_single_event)

        event = events[0]
        assert 'title' in event
        assert 'location' in event
        assert 'start_time' in event
        assert 'end_time' in event
        assert 'start_date' in event
        assert 'end_date' in event
        assert 'day_codes' in event
        assert 'day_of_week' in event
        assert 'latitude' in event
        assert 'longitude' in event

    @patch('app.utils.gmaps')
    def test_geocoding_failure(self, mock_gmaps, sample_ics_single_event):
        """Test graceful handling of geocoding failures."""
        mock_gmaps.geocode.side_effect = Exception("API Error")

        from app.utils import parse_ics
        events = parse_ics(sample_ics_single_event)

        # Should still parse events, just without coordinates
        assert len(events) > 0
        assert events[0]['latitude'] is None
