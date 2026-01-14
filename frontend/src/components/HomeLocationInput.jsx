import { useEffect, useRef, useState } from 'react';
import { FiHome, FiNavigation, FiX } from 'react-icons/fi';
import { IoLocationSharp } from 'react-icons/io5';

// US State name to abbreviation mapping
const STATE_ABBR = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
};

const getStateAbbr = (statePart) => {
  if (!statePart) return '';
  // If already 2 chars, assume it's an abbreviation
  const trimmed = statePart.trim().split(' ')[0];
  if (trimmed.length === 2 && trimmed === trimmed.toUpperCase()) return trimmed;
  // Try to find in mapping
  for (const [name, abbr] of Object.entries(STATE_ABBR)) {
    if (statePart.toLowerCase().startsWith(name.toLowerCase())) return abbr;
  }
  return trimmed;
};

// Format a full address into "Street Address, City, ST" format
const formatLocationForDisplay = (fullLocation) => {
  if (!fullLocation) return '';
  const parts = fullLocation.split(', ');
  const street = parts[0] || '';
  const city = parts[1] || '';
  const statePart = parts[2] || '';
  const stateAbbr = getStateAbbr(statePart);

  let display = street;
  if (city || stateAbbr) {
    display += ', ' + city;
    if (city && stateAbbr) display += ', ';
    display += stateAbbr;
  }
  return display;
};

export default function HomeLocationInput({
  onSetLocation,
  currentLocation,
  isGeocoding = false,
  geoError = '',
  onClear,
}) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  // Get user's current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode to get address
        try {
          const url = new URL(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`
          );
          url.searchParams.set('access_token', import.meta.env.VITE_MAPBOX_TOKEN);
          url.searchParams.set('limit', '1');
          const res = await fetch(url.toString());
          const data = await res.json();
          const place = data.features?.[0];
          onSetLocation({
            title: 'Home',
            location: place?.place_name || 'Current Location',
            longitude,
            latitude,
            isHome: true,
          });
        } catch (e) {
          console.error('Reverse geocode failed', e);
          onSetLocation({
            title: 'Home',
            location: 'Current Location',
            longitude,
            latitude,
            isHome: true,
          });
        }
      },
      (err) => console.error('Geolocation error', err),
      { enableHighAccuracy: true }
    );
  };

  // Clear everything (input + saved location)
  const handleClear = () => {
    setQ('');
    setItems([]);
    if (currentLocation) {
      onClear();
    }
    inputRef.current?.focus();
  };

  // Use Google Places API for better recommendations
  useEffect(() => {
    if (!q.trim()) {
      setItems([]);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const id = setTimeout(async () => {
      try {
        setLoading(true);

        const url = new URL(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json`
        );
        url.searchParams.set('access_token', import.meta.env.VITE_MAPBOX_TOKEN);
        url.searchParams.set('autocomplete', 'true');
        url.searchParams.set('limit', '5');
        url.searchParams.set('types', 'address,place,poi');

        const res = await fetch(url.toString(), { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setItems(
          (data.features || []).map((f) => {
            // Parse address parts
            const parts = f.place_name.split(', ');
            const streetFull = parts[0] || '';
            const city = parts[1] || '';
            // Extract state abbreviation (e.g., "Virginia" -> "VA")
            const statePart = parts[2] || '';
            const stateAbbr = getStateAbbr(statePart);

            // Split street into number and name
            const streetMatch = streetFull.match(/^(\d+)\s+(.+)$/);
            const streetNumber = streetMatch ? streetMatch[1] : '';
            const streetName = streetMatch ? streetMatch[2] : streetFull;

            return {
              id: f.id,
              streetNumber,
              streetName,
              city,
              stateAbbr,
              full: f.place_name,
              center: f.center,
            };
          })
        );
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Geocoding search error', e);
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setItems([]);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const pick = (it) => {
    setItems([]);
    setQ('');
    if (!it?.center) return;
    const [lng, lat] = it.center;
    onSetLocation({
      title: 'Home',
      location: it.full,
      longitude: lng,
      latitude: lat,
      isHome: true,
    });
  };

  // Determine which button to show - only ONE at a time
  const showClearButton = q.length > 0 || currentLocation;

  return (
    <div ref={boxRef} className="relative w-full">
      {/* Styled search bar */}
      <div className="relative">
        {/* Left home icon */}
        <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
          <FiHome className="h-4 w-4 text-sky-600" />
        </div>

        <div className="flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 focus-within:border-sky-600 focus-within:ring-1 focus-within:ring-sky-600">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              currentLocation
                ? formatLocationForDisplay(currentLocation.location)
                : 'Enter home address or starting point'
            }
            className="ml-6 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none"
            disabled={isGeocoding}
          />

          {/* Only ONE button: X (if typing or location set) or Arrow (otherwise) */}
          {showClearButton ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 text-slate-400 hover:text-slate-900 active:scale-[0.98]"
              aria-label="Clear"
              title="Clear"
            >
              <FiX className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCurrentLocation}
              className="rounded p-1 text-slate-400 hover:text-sky-600 active:scale-[0.98]"
              aria-label="Use current location"
              title="Use current location"
            >
              <FiNavigation className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
            <span className="text-sm text-slate-500">Searching...</span>
          </div>
        </div>
      )}

      {geoError && <div className="mt-1 text-xs text-red-600">{geoError}</div>}

      {/* Google Maps style dropdown - single line */}
      {items.length > 0 && !loading && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {items.map((it) => (
            <li
              key={it.id}
              onClick={() => pick(it)}
              className="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50"
            >
              {/* Location icon - grey fill, blue on hover */}
              <IoLocationSharp className="h-5 w-5 flex-shrink-0 text-slate-300 transition-colors group-hover:text-sky-600" />

              {/* Formatted address: bold number + street name  city, STATE */}
              <span className="truncate text-sm">
                <span className="font-semibold text-slate-900">{it.streetNumber}</span>
                {it.streetNumber && ' '}
                <span className="text-slate-700">{it.streetName}</span>
                {(it.city || it.stateAbbr) && '  '}
                <span className="text-slate-500">
                  {it.city}
                  {it.city && it.stateAbbr && ', '}
                  {it.stateAbbr}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
