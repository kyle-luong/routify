from ics import Calendar
from datetime import datetime, timedelta
import calendar
import googlemaps
import os
from dotenv import load_dotenv

load_dotenv()
gmaps = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_KEY"))

ICAL_TO_WEEKDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
ICAL_TO_PYDAY = {
    "MO": 0, "TU": 1, "WE": 2, "TH": 3, "FR": 4, "SA": 5, "SU": 6,
}
WEEKDAY_ORDER = list(calendar.day_name)

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
                    until_date = datetime.strptime(until, "%Y%m%dT%H%M%S").date() if "T" in until else datetime.strptime(until, "%Y%m%d").date()
                if "BYDAY" in parts:
                    day_codes = parts["BYDAY"].split(",")

        if not day_codes:
            day_codes = [ICAL_TO_WEEKDAY[event.begin.weekday()]]
        if until_date:
            end_date = until_date

        location_key = f"{event.location}, {school_location} university"

        # Cache geocoding
        if location_key in location_cache:
            lat, lng = location_cache[location_key]
        else:
            try:
                geo = gmaps.geocode(location_key)
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
