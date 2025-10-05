import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';

import MapBox from '../components/map/MapBox';
import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleList from '../components/ScheduleList';
import ShareableLink from '../components/ShareableLink';
import { apiFetch } from '../lib/api';

export default function SchedulePage() {
  const { short_id } = useParams();
  const [events_coords, setEventsCoords] = useState([]); // all events (with coords only for map use)
  const [events_list, setEventsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeFormat, setTimeFormat] = useState('12h');
  const [transportMode, setTransportMode] = useState('walking');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session events
  useEffect(() => {
    if (!short_id) return;

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
        console.error('Failed to load events', err);
        setError('Failed to load events.');
        setLoading(false);
        if (!selectedDate) setSelectedDate(new Date());
      });
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

  // Build segments and single-event markers
  const { segments, singleEvents } = useMemo(() => {
    const segs = [];
    const singles = [];
    if (filteredEvents_coords.length === 1) {
      singles.push(filteredEvents_coords[0]);
    } else if (filteredEvents_coords.length > 1) {
      for (let i = 0; i < filteredEvents_coords.length - 1; i++) {
        segs.push([filteredEvents_coords[i], filteredEvents_coords[i + 1]]);
      }
    }
    return { segments: segs, singleEvents: singles };
  }, [filteredEvents_coords]);
  console.log({ segments, singleEvents });

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 md:px-8">
      <div className="h-full w-full max-w-6xl md:grid md:h-[82vh] md:grid-cols-2 md:gap-12">
        {/* Left: Schedule card */}
        <div className="relative flex h-full flex-col space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <ScheduleHeader
            selectedDate={selectedDate || new Date()}
            setSelectedDate={setSelectedDate}
            timeFormat={timeFormat}
            setTimeFormat={setTimeFormat}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            eventDates={[...new Set(events_list.map((e) => e.start_date))]}
          />

          {short_id && <ShareableLink shortId={short_id} />}

          <ScheduleList
            events={filteredEvents}
            timeFormat={timeFormat}
            transportMode={transportMode}
          />
        </div>

        {/* Right: Map */}
        <div className="flex h-full items-center justify-center">
          <div className="flex h-[440px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
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
