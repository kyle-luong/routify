from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from ics import Calendar
import googlemaps
from datetime import timedelta, datetime
from collections import defaultdict
from django.utils import timezone
import calendar
import os
from dotenv import load_dotenv
from django.http import HttpResponse

from .models import Session, Event
from .utils.hashids import encode_id, decode_id

load_dotenv()
GOOGLE_MAP_TOKEN = os.environ.get("GOOGLE_MAP_TOKEN")
gmaps = googlemaps.Client(key=GOOGLE_MAP_TOKEN)

WEEKDAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
ICAL_TO_WEEKDAY = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]


class UploadICSView(APIView):
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        school_location = request.data.get("school_location", "").strip()

        if not file or not school_location:
            return Response({"error": "Missing file or school_location."}, status=400)

        school_location += " university"

        try:
            cal = Calendar(file.read().decode("utf-8"))
            raw_events = list(cal.events)
        except Exception as e:
            return Response({"error": "Invalid ICS file", "details": str(e)}, status=400)

        if not raw_events:
            return Response({"error": "No valid events found."}, status=400)

        session = Session.objects.create()

        for event in raw_events:
            title = event.name or "Untitled"
            location = event.location or ""
            start_time = event.begin.time()
            end_time = event.end.time()
            start_date = event.begin.date()
            end_date = None
            day_codes = []

            for line in event.extra:
                if line.name == "RRULE":
                    try:
                        rrule = line.value.split(";")
                        rule_dict = dict(pair.split("=") for pair in rrule if "=" in pair)
                        if "UNTIL" in rule_dict:
                            until_str = rule_dict["UNTIL"]
                            try:
                                end_date = datetime.strptime(until_str, "%Y%m%dT%H%M%S").date()
                            except:
                                end_date = datetime.strptime(until_str, "%Y%m%d").date()
                        if "BYDAY" in rule_dict:
                            day_codes = rule_dict["BYDAY"].split(",")
                    except Exception as e:
                        print(f"RRULE parse error: {e}")

            if not end_date:
                end_date = start_date

            if not day_codes:
                day_codes = [ICAL_TO_WEEKDAY[event.begin.weekday()]]

            try:
                day_of_week = sorted(
                    {calendar.day_name[ICAL_TO_WEEKDAY.index(code)] for code in day_codes},
                    key=WEEKDAY_ORDER.index
                )
            except:
                day_of_week = [calendar.day_name[event.begin.weekday()]]

            # Geocode location
            lat = lng = None
            query = f"{location}, {school_location}"
            try:
                if location:
                    geo = gmaps.geocode(query)
                    if geo:
                        lat = geo[0]['geometry']['location']['lat']
                        lng = geo[0]['geometry']['location']['lng']
            except Exception as e:
                print(f"Geocoding error for '{query}': {e}")

            Event.objects.create(
                session=session,
                title=title,
                location=location,
                start_time=start_time,
                end_time=end_time,
                start_date=start_date,
                end_date=end_date,
                day_of_week=day_of_week,
                latitude=lat,
                longitude=lng
            )

        return Response({
            "session_id": str(session.uuid),
            "short_id": encode_id(session.id),
        }, status=201)


class SessionEventsView(APIView):
    def get(self, request, short_id):
        session_id = decode_id(short_id)
        if not session_id:
            return Response({"error": "Invalid session link."}, status=404)

        try:
            events = Session.objects.get(id=session_id).events.all()
        except Session.DoesNotExist:
            return Response({"error": "Session not found."}, status=404)

        result = []
        for e in events:
            result.append({
                "title": e.title,
                "location": e.location,
                "start": e.start_time.strftime('%H:%M'),
                "end": e.end_time.strftime('%H:%M'),
                "start_date": e.start_date.strftime('%Y-%m-%d'),
                "end_date": e.end_date.strftime('%Y-%m-%d'),
                "dayOfWeek": e.day_of_week,
                "latitude": e.latitude,
                "longitude": e.longitude,
            })

        return Response({ "events": result })
    
# for testing purposes:
def home(request):
    html = """
    <html>
      <head>
        <title>Test Connection</title>
      </head>
      <body>
        <h1>Django backend is alive and running</h1>
      </body>
    </html>
    """
    return HttpResponse(html)
