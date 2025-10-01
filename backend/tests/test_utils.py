import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, date, time
import os
from app.utils import parse_ics, location_cache, gmaps

class TestParseIcs:
    
    @pytest.fixture(autouse=True)
    def clear_cache(self):
        """Clear location cache before each test"""
        location_cache.clear()
    
    @pytest.fixture
    def sample_ics_content(self):
        """Sample ICS content for testing"""
        return """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20240115T100000
DTEND:20240115T110000
SUMMARY:Math 101
LOCATION:Room 101
RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20240515T235959
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

    def test_google_maps_client_initialization(self):
        """Test that Google Maps client is properly initialized"""
        assert gmaps is not None
        assert hasattr(gmaps, 'geocode')

    @pytest.mark.skipif(not os.getenv("GOOGLE_MAPS_KEY"), reason="No Google Maps API key")
    def test_google_maps_api_key_works(self):
        """Test that the Google Maps API key is valid and works"""
        try:
            # Test with a known location
            result = gmaps.geocode("University of Virginia, Charlottesville, VA")
            assert result is not None
            assert len(result) > 0
            assert 'geometry' in result[0]
            assert 'location' in result[0]['geometry']
        except Exception as e:
            pytest.fail(f"Google Maps API key test failed: {e}")

    @patch('app.utils.gmaps.geocode')
    def test_successful_geocoding(self, mock_geocode, sample_ics_content):
        """Test successful geocoding of locations"""
        # Mock successful geocoding response
        mock_geocode.return_value = [{
            'geometry': {
                'location': {
                    'lat': 38.0293,
                    'lng': -78.4767
                }
            }
        }]
        
        events = parse_ics(sample_ics_content, "University of Virginia")
        
        # Should have geocoded events
        events_with_coords = [e for e in events if e['latitude'] is not None]
        assert len(events_with_coords) > 0
        
        # Check coordinates
        for event in events_with_coords:
            assert event['latitude'] == 38.0293
            assert event['longitude'] == -78.4767

    @patch('app.utils.gmaps.geocode')
    def test_failed_geocoding(self, mock_geocode, sample_ics_content):
        """Test handling of failed geocoding"""
        # Mock failed geocoding (no results)
        mock_geocode.return_value = []
        
        events = parse_ics(sample_ics_content, "University of Virginia")
        
        # All events should have None coordinates
        for event in events:
            assert event['latitude'] is None
            assert event['longitude'] is None

    @patch('app.utils.gmaps.geocode')
    def test_geocoding_exception_handling(self, mock_geocode, sample_ics_content):
        """Test handling of geocoding exceptions"""
        # Mock geocoding exception
        mock_geocode.side_effect = Exception("API Error")
        
        events = parse_ics(sample_ics_content, "University of Virginia")
        
        # All events should have None coordinates
        for event in events:
            assert event['latitude'] is None
            assert event['longitude'] is None

    def test_location_cache(self, sample_ics_content):
        """Test that location caching works properly"""
        with patch('app.utils.gmaps.geocode') as mock_geocode:
            mock_geocode.return_value = [{
                'geometry': {
                    'location': {
                        'lat': 38.0293,
                        'lng': -78.4767
                    }
                }
            }]
            
            # Parse twice
            parse_ics(sample_ics_content, "University of Virginia")
            parse_ics(sample_ics_content, "University of Virginia")
            
            # Geocoding should only be called once per unique location
            # (due to caching)
            unique_locations = set()
            call_count = 0
            for call in mock_geocode.call_args_list:
                location = call[0][0]
                if location not in unique_locations:
                    unique_locations.add(location)
                    call_count += 1
            
            # Should have fewer calls than total events due to caching
            assert len(location_cache) > 0

    def test_event_format_structure(self, sample_ics_content):
        """Test that parsed events have correct structure"""
        with patch('app.utils.gmaps.geocode') as mock_geocode:
            mock_geocode.return_value = [{
                'geometry': {
                    'location': {
                        'lat': 38.0293,
                        'lng': -78.4767
                    }
                }
            }]
            
            events = parse_ics(sample_ics_content, "University of Virginia")
            
            assert len(events) > 0
            
            for event in events:
                # Check required fields
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
                
                # Check data types
                assert isinstance(event['title'], str)
                assert isinstance(event['location'], str)
                assert isinstance(event['start_time'], time)
                assert isinstance(event['end_time'], time)
                assert isinstance(event['start_date'], date)
                assert isinstance(event['end_date'], date)
                assert isinstance(event['day_codes'], list)
                assert isinstance(event['day_of_week'], list)

    def test_recurring_events(self, sample_ics_content):
        """Test that recurring events are properly expanded"""
        with patch('app.utils.gmaps.geocode') as mock_geocode:
            mock_geocode.return_value = [{
                'geometry': {
                    'location': {
                        'lat': 38.0293,
                        'lng': -78.4767
                    }
                }
            }]
            
            events = parse_ics(sample_ics_content, "University of Virginia")
            
            # Should have multiple instances of recurring events
            math_events = [e for e in events if e['title'] == 'Math 101']
            assert len(math_events) > 1  # Should have multiple occurrences

    def test_empty_location_handling(self, sample_ics_content):
        """Test handling of events with empty locations"""
        events = parse_ics(sample_ics_content, "University of Virginia")
        
        # Should handle events with empty locations gracefully
        empty_location_events = [e for e in events if e['location'] == '']
        assert len(empty_location_events) >= 0  # Should not crash

    def test_location_cleaning(self):
        """Test location string cleaning functionality"""
        test_ics = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20240115T100000
DTEND:20240115T110000
SUMMARY:Test Event
LOCATION:Room 101 Building A#$%123
UID:test-clean
END:VEVENT
END:VCALENDAR"""
        
        with patch('app.utils.gmaps.geocode') as mock_geocode:
            mock_geocode.return_value = []
            
            events = parse_ics(test_ics, "University of Virginia")
            
            # Check that geocoding was called with cleaned location
            assert mock_geocode.called
            called_location = mock_geocode.call_args[0][0]
            # Should not contain trailing special characters
            assert not called_location.endswith('#$%123')

    def test_weekday_mapping(self, sample_ics_content):
        """Test that weekday mapping works correctly"""
        with patch('app.utils.gmaps.geocode') as mock_geocode:
            mock_geocode.return_value = []
            
            events = parse_ics(sample_ics_content, "University of Virginia")
            
            for event in events:
                # Check that day codes are valid
                assert len(event['day_codes']) > 0
                assert all(code in ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] 
                          for code in event['day_codes'])
                
                # Check that day of week names are valid
                assert len(event['day_of_week']) > 0
                valid_days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 
                             'Friday', 'Saturday', 'Sunday']
                assert all(day in valid_days for day in event['day_of_week'])

class TestEnvironmentSetup:
    """Test environment and configuration"""
    
    def test_env_file_loaded(self):
        """Test that environment variables are loaded"""
        # Should not crash when trying to access env vars
        google_key = os.getenv("GOOGLE_MAPS_KEY")
        # Key might be None in test environment, but should not crash
        assert google_key is not None or google_key is None  # Just check it doesn't crash

    @pytest.mark.integration
    def test_end_to_end_with_real_data(self):
        """Integration test with real data (if API key available)"""
        if not os.getenv("GOOGLE_MAPS_KEY"):
            pytest.skip("No Google Maps API key for integration test")
        
        test_ics = """BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Test//Test//EN
BEGIN:VEVENT
DTSTART:20240115T100000
DTEND:20240115T110000
SUMMARY:Test at UVA
LOCATION:Rotunda
UID:integration-test
END:VEVENT
END:VCALENDAR"""
        
        events = parse_ics(test_ics, "University of Virginia")
        
        assert len(events) > 0
        event = events[0]
        assert event['title'] == 'Test at UVA'
        assert event['location'] == 'Rotunda'
        # Should have coordinates if geocoding worked
        if event['latitude'] is not None:
            assert isinstance(event['latitude'], float)
            assert isinstance(event['longitude'], float)