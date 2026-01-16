import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useParams } from 'react-router-dom';

import WeeklyCalendar from '../components/WeeklyCalendar';
import { apiFetch } from '../lib/api';
import { logger } from '../lib/logger';
import { saveSession } from '../lib/session';

export default function CalendarPage() {
  const { short_id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeFormat] = useState('12h');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setEvents(raw);

        // Auto-select today or first event date
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const eventDates = [...new Set(raw.map((e) => e.start_date))].sort();

        if (eventDates.includes(todayStr)) {
          setSelectedDate(new Date());
        } else if (eventDates.length > 0) {
          // Find closest upcoming date
          const upcoming = eventDates.filter((d) => d >= todayStr);
          if (upcoming.length > 0) {
            setSelectedDate(parseISO(upcoming[0]));
          } else {
            setSelectedDate(parseISO(eventDates[0]));
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        logger.error('Failed to load events', err);
        setError('Failed to load events.');
        setLoading(false);
      });
  }, [short_id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center bg-slate-50 sm:min-h-[calc(100vh-56px)]">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 text-sky-600" />
          <span className="text-slate-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-48px)] items-center justify-center bg-slate-50 sm:min-h-[calc(100vh-56px)]">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-48px)] flex-col bg-slate-50 sm:h-[calc(100vh-56px)]">
      {/* Main content - centered calendar */}
      <div className="flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-4 md:p-6">
        <div className="flex h-full w-full max-w-5xl">
          <WeeklyCalendar
            events={events}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            timeFormat={timeFormat}
            shortId={short_id}
          />
        </div>
      </div>
    </div>
  );
}
