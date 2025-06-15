import { useEffect, useState } from 'react';
import { isSameDay, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';

import ScheduleHeader from '../components/ScheduleHeader';
import ScheduleList from '../components/ScheduleList';
import ShareableLink from '../components/ShareableLink';
import MapBox from '../components/MapBox';

export default function SchedulePage() {
  const { short_id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeFormat, setTimeFormat] = useState('12h');
  const [transportMode, setTransportMode] = useState('walking');

  // API Error Handling
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions/${short_id}`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.events.filter((e) => e.latitude && e.longitude);
        setEvents(filtered);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load events.");
        setLoading(false);
      });
  }, [short_id]);

  const filteredEvents = events
    .map((e) => ({ ...e, date: parseISO(e.start_date) }))
    .filter((e) => isSameDay(e.date, selectedDate))
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 md:px-8">
      <div className="h-full w-full max-w-6xl md:grid md:h-[82vh] md:grid-cols-2 md:gap-12">
        {/* Left: Schedule card */}
        <div className="relative flex h-full flex-col space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-md">
          <ScheduleHeader
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            timeFormat={timeFormat}
            setTimeFormat={setTimeFormat}
            transportMode={transportMode}
            setTransportMode={setTransportMode}
            eventDates={[...new Set(events.map((e) => e.start_date))]}
          />

          {short_id && <ShareableLink shortId={short_id} />}

          <ScheduleList
            events={filteredEvents}
            timeFormat={timeFormat}
            transportMode={transportMode}
          />
        </div>

        {/* Right: Map placeholder */}
        <div className="flex h-full items-center justify-center">
          <div className="flex h-[440px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500">
          {loading && <div>Loading...</div>}
          {error && <div>{error}</div>}
          {/* MapBox isn't rendered until the data is fully loaded */}
          {!loading && !error && (
            <MapBox
              key={selectedDate.toISOString()}
              segments={filteredEvents}
              selectedPair={[null, null]}
              selectedDay={selectedDate}
            />
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
