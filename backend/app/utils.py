from ics import Calendar
from datetime import datetime, timedelta
import calendar
import googlemaps
import os
import re
import logging
from collections import Counter
from dotenv import load_dotenv

load_dotenv()
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_KEY"))
logger = logging.getLogger(__name__)

ICAL_TO_WEEKDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
WEEKDAY_ORDER = list(calendar.day_name)

# Date bounds for validation
MIN_DATE_YEAR = 2020
MAX_DATE_YEAR = 2030

# Location types that indicate high confidence (Google Maps result types)
HIGH_CONFIDENCE_TYPES = {"premise", "street_address", "establishment", "point_of_interest", "university"}


def clean_location(location: str) -> str:
    """Clean location string for geocoding."""
    if not location:
        return ""
    # Remove trailing room numbers, codes, etc.
    cleaned = re.sub(r'[^a-zA-Z\s,.-]+$', '', location).strip()
    return cleaned


def geocode_location(address: str, bias_coords: dict = None) -> dict:
    """
    Geocode a single address, optionally with coordinate bias.
    Returns dict with lat, lng, confidence score, and raw result.
    """
    if not address:
        return {"lat": None, "lng": None, "confidence": 0, "raw": None}

    try:
        params = {"address": address}
        if bias_coords:
            delta = 0.05  # ~5km radius
            params["bounds"] = {
                "southwest": {"lat": bias_coords["lat"] - delta, "lng": bias_coords["lng"] - delta},
                "northeast": {"lat": bias_coords["lat"] + delta, "lng": bias_coords["lng"] + delta},
            }

        results = gmaps.geocode(**params)
        if not results:
            return {"lat": None, "lng": None, "confidence": 0, "raw": None}

        result = results[0]
        location = result["geometry"]["location"]

        # Calculate confidence based on result type and location_type
        confidence = calculate_confidence(result)

        return {
            "lat": location["lat"],
            "lng": location["lng"],
            "confidence": confidence,
            "raw": result
        }
    except Exception as e:
        logger.debug(f"Geocoding failed for '{address}': {e}")
        return {"lat": None, "lng": None, "confidence": 0, "raw": None}


def calculate_confidence(result: dict) -> float:
    """
    Calculate confidence score for a geocode result.
    Higher = more specific/reliable.
    """
    score = 0.5  # Base score

    types = set(result.get("types", []))
    geometry = result.get("geometry", {})

    # Boost for specific location types
    if types & HIGH_CONFIDENCE_TYPES:
        score += 0.3

    # Boost for ROOFTOP precision
    if geometry.get("location_type") == "ROOFTOP":
        score += 0.2
    elif geometry.get("location_type") == "RANGE_INTERPOLATED":
        score += 0.1

    # Check for educational institution indicators
    address = result.get("formatted_address", "").lower()
    if any(word in address for word in ["university", "college", "campus", "hall"]):
        score += 0.1

    return min(score, 1.0)


def find_anchor(geocoded_locations: dict) -> dict:
    """
    Find the best "anchor" location to use as bias for others.
    Returns the coordinates of the highest confidence result.
    """
    best_anchor = None
    best_score = 0

    for loc, data in geocoded_locations.items():
        if data["lat"] is None:
            continue
        if data["confidence"] > best_score:
            best_score = data["confidence"]
            best_anchor = {"lat": data["lat"], "lng": data["lng"]}

    return best_anchor


def cluster_locations(geocoded_locations: dict) -> dict:
    """
    Find the geographic center of successfully geocoded locations.
    Uses simple centroid calculation.
    """
    valid_coords = [
        (data["lat"], data["lng"])
        for data in geocoded_locations.values()
        if data["lat"] is not None
    ]

    if not valid_coords:
        return None

    avg_lat = sum(c[0] for c in valid_coords) / len(valid_coords)
    avg_lng = sum(c[1] for c in valid_coords) / len(valid_coords)

    return {"lat": avg_lat, "lng": avg_lng}


def parse_ics(file_content: str, school_location: str = None):
    """
    Parse ICS file and geocode locations using anchor detection.
    school_location parameter is now optional (kept for backwards compatibility).
    """
    events = []
    cal = Calendar(file_content)

    # Step 1: Extract all unique locations
    unique_locations = {}
    event_data = []

    for event in cal.events:
        start_date = event.begin.date()
        end_date = start_date
        day_codes = []
        until_date = None

        for line in event.extra:
            if line.name == "RRULE":
                parts = dict(x.split("=") for x in line.value.split(";") if "=" in x)
                if "UNTIL" in parts:
                    until = parts["UNTIL"]
                    try:
                        until_date = datetime.strptime(until, "%Y%m%dT%H%M%S").date() if "T" in until else datetime.strptime(until, "%Y%m%d").date()
                        if until_date.year < MIN_DATE_YEAR or until_date.year > MAX_DATE_YEAR:
                            until_date = None
                    except ValueError:
                        until_date = None
                if "BYDAY" in parts:
                    day_codes = parts["BYDAY"].split(",")

        if not day_codes:
            day_codes = [ICAL_TO_WEEKDAY[event.begin.weekday()]]
        if until_date:
            end_date = until_date

        original_location = event.location or ""
        cleaned_location = clean_location(original_location)

        if cleaned_location:
            unique_locations[cleaned_location] = None  # Will fill with geocode result

        event_data.append({
            "name": event.name or "Untitled",
            "original_location": original_location,
            "cleaned_location": cleaned_location,
            "start_date": start_date,
            "end_date": end_date,
            "day_codes": day_codes,
            "start_time": event.begin.time(),
            "end_time": event.end.time(),
        })

    # Step 2: First pass - geocode all unique locations without bias
    geocoded = {}
    for loc in unique_locations.keys():
        geocoded[loc] = geocode_location(loc)

    # Step 3: Find anchor (highest confidence result)
    anchor = find_anchor(geocoded)

    # If no anchor found, try using cluster centroid
    if not anchor:
        anchor = cluster_locations(geocoded)

    # Step 4: Second pass - re-geocode failed/low-confidence locations with anchor bias
    if anchor:
        for loc, data in geocoded.items():
            if data["lat"] is None or data["confidence"] < 0.5:
                # Try again with anchor bias
                retry = geocode_location(loc, bias_coords=anchor)
                if retry["lat"] is not None:
                    geocoded[loc] = retry

    # Step 5: Build final event list
    for ev in event_data:
        geo = geocoded.get(ev["cleaned_location"], {"lat": None, "lng": None})

        current = ev["start_date"]
        while current <= ev["end_date"]:
            if ICAL_TO_WEEKDAY[current.weekday()] in ev["day_codes"]:
                events.append({
                    "title": ev["name"],
                    "location": ev["original_location"],
                    "start_time": ev["start_time"],
                    "end_time": ev["end_time"],
                    "start_date": current,
                    "end_date": current,
                    "day_codes": [ICAL_TO_WEEKDAY[current.weekday()]],
                    "day_of_week": [calendar.day_name[current.weekday()]],
                    "latitude": geo["lat"],
                    "longitude": geo["lng"],
                })
            current += timedelta(days=1)

    return events
