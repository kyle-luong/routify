from ics import Calendar
from datetime import datetime, timedelta
import calendar
import googlemaps
import os
import re
from dotenv import load_dotenv

from app.schools import resolve_location

load_dotenv()
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_KEY"))

ICAL_TO_WEEKDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
WEEKDAY_ORDER = list(calendar.day_name)

# Date bounds for validation (reasonable range for academic calendars)
MIN_DATE_YEAR = 2020
MAX_DATE_YEAR = 2030

location_cache = {}

def parse_ics(file_content, school_location):
    events = []
    cal = Calendar(file_content)

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
                        # Bounds check
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

        # Keep original location
        original_location = event.location or ""

        # Clean for geocoding (remove trailing room numbers, etc.)
        cleaned_location = original_location
        if cleaned_location:
            cleaned_location = re.sub(r'[^a-zA-Z\s,.-]+$', '', cleaned_location).strip()

        # Resolve location using school config
        location_key, bias_coords = resolve_location(cleaned_location, school_location)

        # Cache geocoding
        if location_key in location_cache:
            lat, lng = location_cache[location_key]
        elif not location_key:
            lat = lng = None
        else:
            try:
                # Build geocode params with optional bias
                geocode_params = {"address": location_key}
                if bias_coords:
                    # Use bounds to bias results toward school area
                    delta = 0.05  # ~5km radius
                    geocode_params["bounds"] = {
                        "southwest": {"lat": bias_coords["lat"] - delta, "lng": bias_coords["lng"] - delta},
                        "northeast": {"lat": bias_coords["lat"] + delta, "lng": bias_coords["lng"] + delta},
                    }

                geo = gmaps.geocode(**geocode_params)
                if geo:
                    lat = geo[0]["geometry"]["location"]["lat"]
                    lng = geo[0]["geometry"]["location"]["lng"]
                else:
                    lat = lng = None
            except Exception:
                lat = lng = None
            location_cache[location_key] = (lat, lng)

        current = start_date
        while current <= end_date:
            if ICAL_TO_WEEKDAY[current.weekday()] in day_codes:
                events.append({
                    "title": event.name or "Untitled",
                    "location": event.location or "",
                    "start_time": event.begin.time(),
                    "end_time": event.end.time(),
                    "start_date": current,
                    "end_date": current,
                    "day_codes": [ICAL_TO_WEEKDAY[current.weekday()]],
                    "day_of_week": [calendar.day_name[current.weekday()]],
                    "latitude": lat,
                    "longitude": lng,
                })
            current += timedelta(days=1)

    return events
