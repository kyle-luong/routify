import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';

import HomeLocationInput from '../components/HomeLocationInput';
import MapBox from '../components/map/MapBox';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleList from '../components/ScheduleList';
import ShareableLink from '../components/ShareableLink';
import { apiFetch, getCommuteTimes } from '../lib/api';
import { logger } from '../lib/logger';
import { saveSession } from '../lib/session';

export default function SchedulePage() {
  const { short_id } = useParams();
  const [events_coords, setEventsCoords] = useState([]); // all events (with coords only for map use)
  const [events_list, setEventsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFormat, setTimeFormat] = useState('12h');
  const [transportMode, setTransportMode] = useState('walking');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commuteTimes, setCommuteTimes] = useState([]);

  const [homeLocation, setHomeLocation] = useState(() => {
    const s = localStorage.getItem('homeLocation');
    return s ? JSON.parse(s) : null;
  });
  useEffect(() => {
    if (homeLocation) localStorage.setItem('homeLocation', JSON.stringify(homeLocation));
    else localStorage.removeItem('homeLocation');
  }, [homeLocation]);

  // Fetch session events
  useEffect(() => {
    if (!short_id) return;

    // Save session for navbar persistence
    saveSession(short_id);

    setLoading(true);
    setError(null);

    apiFetch(`/api/sessions/${short_id}`)
      .then((data) => {
        const raw = Array.isArray(data.events) ? data.events : [];
        setEventsList(raw);

        // Keep only events that have coordinates for map purposes
        const withCoords = raw.filter((e) => e.latitude && e.longitude);
        setEventsCoords(withCoords);

        // Determine which date to auto-select
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const eventDateSet = new Set(withCoords.map((e) => e.start_date));

        let targetDateStr = null;

        if (eventDateSet.has(todayStr)) {
          targetDateStr = todayStr;
        } else {
          // Find next upcoming date after today
          const upcoming = [...eventDateSet].filter((d) => d >= todayStr).sort();
          if (upcoming.length > 0) {
            targetDateStr = upcoming[0];
          } else {
            // Fallback: earliest available
            const allSorted = [...eventDateSet].sort();
            if (allSorted.length > 0) targetDateStr = allSorted[0];
          }
        }

        if (targetDateStr) {
          setSelectedDate(parseISO(targetDateStr));
        } else {
          // No events at all
          setSelectedDate(new Date()); // default so UI still works
        }

        setLoading(false);
      })
      .catch((err) => {
        logger.error('Failed to load events', err);
        setError('Failed to load events.');
        setLoading(false);
        if (!selectedDate) setSelectedDate(new Date());
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [short_id]);

  // Wait until we have a selectedDate determined
  const filteredEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events_list
      .map((e) => ({ ...e, date: parseISO(e.start_date) }))
      .filter((e) => isSameDay(e.date, selectedDate))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events_list, selectedDate]);

  const filteredEvents_coords = useMemo(() => {
    if (!selectedDate) return [];
    return events_coords
      .map((e) => ({ ...e, date: parseISO(e.start_date) }))
      .filter((e) => isSameDay(e.date, selectedDate))
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events_coords, selectedDate]);

  // Fetch commute times when events or transport mode changes
  useEffect(() => {
    if (filteredEvents_coords.length < 2) {
      setCommuteTimes([]);
      return;
    }

    const origins = filteredEvents_coords.slice(0, -1).map((e) => ({
      lat: e.latitude,
      lng: e.longitude,
    }));
    const destinations = filteredEvents_coords.slice(1).map((e) => ({
      lat: e.latitude,
      lng: e.longitude,
    }));

    getCommuteTimes(origins, destinations, transportMode)
      .then((results) => {
        // results is a 2D array; extract diagonal (origin[i] -> destination[i])
        const times = results.map((row, i) => row[i]);
        setCommuteTimes(times);
      })
      .catch((err) => {
        logger.error('Failed to fetch commute times', err);
        setCommuteTimes([]);
      });
  }, [filteredEvents_coords, transportMode]);

  // Build segments and single-event markers
  const { segments, singleEvents } = useMemo(() => {
    const segs = [];
    const singles = [];
    if (
      homeLocation &&
      Number.isFinite(homeLocation.longitude) &&
      Number.isFinite(homeLocation.latitude)
    ) {
      if (filteredEvents_coords.length === 0) {
        singles.push(homeLocation);
      } else {
        segs.push([homeLocation, filteredEvents_coords[0]]);
      }
    }
    if (filteredEvents_coords.length === 1) {
      singles.push(filteredEvents_coords[0]);
    } else if (filteredEvents_coords.length > 1) {
      for (let i = 0; i < filteredEvents_coords.length - 1; i++) {
        segs.push([filteredEvents_coords[i], filteredEvents_coords[i + 1]]);
      }
    }

    return { segments: segs, singleEvents: singles };
  }, [filteredEvents_coords, homeLocation]);

  const handlePickHome = (home) => setHomeLocation(home);
  const handleClearHome = () => setHomeLocation(null);

  return (
    <div className="flex min-h-[calc(100vh-48px)] items-start justify-center bg-slate-50 px-3 py-4 sm:min-h-[calc(100vh-56px)] sm:px-4 sm:py-6 md:px-8">
      {/* On mobile: flex-col-reverse shows map first (top), then schedule list below */}
      <div className="flex h-full w-full max-w-7xl flex-col-reverse gap-6 lg:flex-row">
        {/* Left: Schedule card (appears below map on mobile) */}
        <div className="relative flex h-auto w-full shrink-0 flex-col space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-md sm:p-6 lg:h-[82vh] lg:w-[450px]">
          <ScheduleHeader
            selectedDate={selectedDate || new Date()}
            setSelectedDate={setSelectedDate}
            timeFormat={timeFormat}
            setTimeFormat={setTimeFormat}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            eventDates={[...new Set(events_list.map((e) => e.start_date))]}
          />

          <HomeLocationInput
            currentLocation={homeLocation}
            onSetLocation={handlePickHome}
            onClear={handleClearHome}
          />

          <ScheduleList
            events={filteredEvents}
            timeFormat={timeFormat}
            commuteTimes={commuteTimes}
          />

          {short_id && <ShareableLink shortId={short_id} />}
        </div>

        {/* Right: Map (appears first/top on mobile due to flex-col-reverse) */}
        <div className="flex h-[50vh] flex-1 items-center justify-center lg:h-[82vh]">
          <div className="flex h-full w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
            {loading && <div>Loading...</div>}
            {error && <div>{error}</div>}
            {!loading && !error && selectedDate && (
              <MapBox
                segments={segments}
                singleEvents={singleEvents}
                selectedPair={[null, null]}
                selectedDay={selectedDate}
                transportMode={transportMode}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
