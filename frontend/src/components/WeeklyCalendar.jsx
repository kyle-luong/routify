import { useMemo, useState } from 'react';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { FiCalendar } from 'react-icons/fi';

import ShareableLink from './ShareableLink';

// Height of each hour slot in pixels
const HOUR_HEIGHT = 80;

/**
 * Weekly calendar view similar to university schedule planners.
 * Shows a week with time slots on the left and days across the top.
 */
export default function WeeklyCalendar({
  events = [],
  selectedDate = new Date(),
  onDateChange,
  timeFormat = '12h',
  shortId,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get the start of the week (Sunday)
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 0 }), [selectedDate]);

  // Generate array of 7 days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Get events that fall within the current week
  const weekEvents = useMemo(() => {
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(weekStart, i), 'yyyy-MM-dd')
    );
    return events.filter((event) => weekDates.includes(event.start_date));
  }, [events, weekStart]);

  // Calculate dynamic time range based on events in the week (1 hour before earliest, 1 hour after latest)
  const { startHour, endHour } = useMemo(() => {
    if (weekEvents.length === 0) {
      return { startHour: 8, endHour: 18 }; // Default 8 AM - 6 PM
    }

    let minHour = 24;
    let maxHour = 0;

    weekEvents.forEach((event) => {
      const [startH] = event.start.split(':').map(Number);
      const [endH, endM] = event.end.split(':').map(Number);
      // Calculate the actual end hour - if there are minutes, the class extends into that hour
      const actualEndHour = endM > 0 ? endH + 1 : endH;

      if (startH < minHour) minHour = startH;
      if (actualEndHour > maxHour) maxHour = actualEndHour;
    });

    // Add 1 hour padding before and after
    const start = Math.max(0, minHour - 1);
    const end = Math.min(24, maxHour + 1);

    return { startHour: start, endHour: end };
  }, [weekEvents]);

  // Time slots based on dynamic range
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(hour);
    }
    return slots;
  }, [startHour, endHour]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped = {};
    weekDays.forEach((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      grouped[dayStr] = events.filter((e) => e.start_date === dayStr);
    });
    return grouped;
  }, [events, weekDays]);

  // Convert time string "HH:MM" to minutes from midnight
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Format hour for display
  const formatHour = (hour) => {
    if (timeFormat === '24h') {
      return `${hour}:00`;
    }
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12} ${suffix}`;
  };

  // Format time for event display
  const formatTime = (time) => {
    if (timeFormat === '24h') return time;
    const [hour, minute] = time.split(':').map(Number);
    const suffix = hour >= 12 ? 'pm' : 'am';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  };

  // Calculate event position and height
  const getEventStyle = (event) => {
    const startMinutes = timeToMinutes(event.start);
    const endMinutes = timeToMinutes(event.end);
    const duration = endMinutes - startMinutes;

    // Grid starts at startHour
    const gridStartMinutes = startHour * 60;
    const topOffset = startMinutes - gridStartMinutes;

    // Each hour is HOUR_HEIGHT pixels tall
    const pixelsPerMinute = HOUR_HEIGHT / 60;
    const top = topOffset * pixelsPerMinute;
    const height = Math.max(duration * pixelsPerMinute, 40); // Min height 40px

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Color palette for events (cycle through these)
  const eventColors = [
    'bg-green-100 border-green-300 text-green-900',
    'bg-blue-100 border-blue-300 text-blue-900',
    'bg-yellow-100 border-yellow-300 text-yellow-900',
    'bg-purple-100 border-purple-300 text-purple-900',
    'bg-pink-100 border-pink-300 text-pink-900',
    'bg-orange-100 border-orange-300 text-orange-900',
  ];

  // Get color for event based on title (consistent coloring)
  const getEventColor = (event) => {
    const hash = event.title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return eventColors[hash % eventColors.length];
  };

  // Navigate weeks
  const goToPrevWeek = () => {
    onDateChange?.(addDays(selectedDate, -7));
  };

  const goToNextWeek = () => {
    onDateChange?.(addDays(selectedDate, 7));
  };

  const goToToday = () => {
    onDateChange?.(new Date());
  };

  const handleDateSelect = (date) => {
    if (date) {
      onDateChange?.(date);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header with navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="relative flex items-center gap-2">
          <button
            onClick={goToPrevWeek}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNextWeek}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="ml-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50"
            title="Pick a date"
          >
            <FiCalendar className="h-4 w-4" />
          </button>

          {/* Date picker dropdown */}
          {showDatePicker && (
            <div className="absolute top-full left-0 z-50 mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="text-sm"
              />
            </div>
          )}
        </div>

        {/* Center: Month Year */}
        <h2 className="text-lg font-semibold text-slate-900">{format(weekStart, 'MMMM yyyy')}</h2>

        {/* Right side: Share Link */}
        <div className="flex items-center">{shortId && <ShareableLink shortId={shortId} />}</div>
      </div>

      {/* Calendar grid - scrollable */}
      <div className="flex flex-1 overflow-auto">
        {/* Time column - sticky */}
        <div className="sticky left-0 z-10 w-16 flex-shrink-0 border-r border-slate-200 bg-slate-50">
          {/* Empty header cell - sticky */}
          <div className="sticky top-0 z-20 h-14 border-b border-slate-200 bg-slate-50" />
          {/* Time labels */}
          <div className="relative">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="flex items-start justify-end border-b border-slate-100 pt-1 pr-2 text-xs text-slate-500"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>
        </div>

        {/* Days grid */}
        <div className="flex flex-1">
          {weekDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDay[dayStr] || [];
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={dayStr}
                className={`flex min-w-[140px] flex-1 flex-col border-r border-slate-200 last:border-r-0 ${
                  isToday ? 'bg-slate-100/50' : ''
                }`}
              >
                {/* Day header - sticky */}
                <div
                  className={`sticky top-0 z-10 flex h-14 flex-col items-center justify-center border-b border-slate-200 ${
                    isToday ? 'bg-slate-200' : 'bg-white'
                  }`}
                >
                  <span className="text-xs font-medium text-slate-500 uppercase">
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      isToday
                        ? 'bg-slate-700 text-white'
                        : isSelected
                          ? 'bg-slate-300 text-slate-900'
                          : 'text-slate-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Time slots with events */}
                <div className="relative">
                  {/* Grid lines */}
                  {timeSlots.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className={`border-b ${isToday ? 'border-slate-200' : 'border-slate-100'}`}
                    />
                  ))}

                  {/* Events */}
                  {dayEvents.map((event, idx) => {
                    const style = getEventStyle(event);
                    const colorClass = getEventColor(event);

                    return (
                      <div
                        key={`${event.title}-${idx}`}
                        className={`absolute right-0.5 left-0.5 overflow-hidden rounded border-l-4 px-1.5 py-1 text-xs ${colorClass}`}
                        style={style}
                        title={`${event.title}\n${formatTime(event.start)} - ${formatTime(event.end)}\n${event.location || ''}`}
                      >
                        <div className="leading-tight font-medium">
                          {formatTime(event.start)} - {formatTime(event.end)}
                        </div>
                        <div className="mt-0.5 truncate leading-tight font-bold">{event.title}</div>
                        {event.location && (
                          <div className="mt-0.5 text-[11px] leading-tight font-medium text-slate-700">
                            {event.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
