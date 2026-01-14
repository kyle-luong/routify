import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FiGrid, FiList } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';

import WeeklyCalendar from '../components/WeeklyCalendar';
import { apiFetch } from '../lib/api';

export default function CalendarPage() {
  const { short_id } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeFormat, setTimeFormat] = useState('12h');
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
        console.error('Failed to load events', err);
        setError('Failed to load events.');
        setLoading(false);
      });
  }, [short_id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
          <span className="text-slate-600">Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900">Weekly Schedule</h1>

          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex rounded-lg border border-slate-300 bg-white p-1">
              <Link
                to={`/view/${short_id}`}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                <FiList className="h-4 w-4" />
                List
              </Link>
              <button
                disabled
                className="flex items-center gap-1.5 rounded-md bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700"
              >
                <FiGrid className="h-4 w-4" />
                Calendar
              </button>
            </div>

            {/* Time format toggle */}
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="12h">12-hour</option>
              <option value="24h">24-hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main content - full width calendar */}
      <div className="flex flex-1 overflow-hidden p-4 md:p-6">
        <div className="mx-auto w-full max-w-7xl overflow-hidden">
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
