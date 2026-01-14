"""
School configuration for location disambiguation.

To add a new school:
1. Add an entry to SCHOOLS with coordinates and aliases
2. Aliases map partial location names to full addresses

The geocoder will:
1. Check if location matches any alias pattern
2. If not, append school name and use school coordinates as bias
"""
from typing import Optional, Tuple

SCHOOLS = {
    "university of virginia": {
        "name": "University of Virginia",
        "city": "Charlottesville, VA",
        "coordinates": {"lat": 38.0336, "lng": -78.5080},
        # Aliases for locations that don't geocode well
        # Pattern (lowercase) -> Full address
        "aliases": {
            "physics": "382 McCormick Rd, Charlottesville, VA 22904",
            "physics building": "382 McCormick Rd, Charlottesville, VA 22904",
            "jesse beams lab": "382 McCormick Rd, Charlottesville, VA 22904",
        }
    },
    # Example: Adding another school
    # "virginia tech": {
    #     "name": "Virginia Tech",
    #     "city": "Blacksburg, VA",
    #     "coordinates": {"lat": 37.2284, "lng": -80.4234},
    #     "aliases": {
    #         "torgersen": "620 Drillfield Dr, Blacksburg, VA 24061",
    #     }
    # },
}


def get_school_config(school_location: str) -> Optional[dict]:
    """Get school configuration by name (case-insensitive partial match)."""
    if not school_location:
        return None

    school_lower = school_location.lower()

    # Try exact match first
    if school_lower in SCHOOLS:
        return SCHOOLS[school_lower]

    # Try partial match
    for key, config in SCHOOLS.items():
        if key in school_lower or school_lower in key:
            return config

    return None


def resolve_location(location: str, school_location: str) -> Tuple[str, Optional[dict]]:
    """
    Resolve a location string to a geocodable address.

    Returns:
        (resolved_address, bias_coordinates or None)
    """
    if not location or not location.strip():
        return "", None

    school = get_school_config(school_location)
    location_lower = location.lower().strip()

    if school:
        # Check aliases first
        for pattern, address in school.get("aliases", {}).items():
            if pattern in location_lower:
                return address, None  # Alias is already specific, no bias needed

        # No alias match - append school context and use coordinate bias
        resolved = f"{location}, {school['name']}, {school['city']}"
        return resolved, school.get("coordinates")

    # No school config - just return location with school_location appended
    if school_location:
        return f"{location}, {school_location}", None

    return location, None
