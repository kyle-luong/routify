import { useMemo } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';

import { CalendarHeader, DayColumn, TimeColumn } from './calendar';

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

  // Also provide all event dates (from the full events prop) so date picker
  // can show markers for the entire ICS, not just this week.
  const allEventDates = useMemo(() => {
    return events.map((e) => e.start_date);
  }, [events]);

  // Calculate dynamic time range based on events in the week
  const { startHour, endHour } = useMemo(() => {
    if (weekEvents.length === 0) {
      return { startHour: 8, endHour: 18 }; // Default 8 AM - 6 PM
    }

    let minHour = 24;
    let maxHour = 0;

    weekEvents.forEach((event) => {
      const [startH] = event.start.split(':').map(Number);
      const [endH, endM] = event.end.split(':').map(Number);
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
    // Render slots from startHour (inclusive) to endHour (exclusive)
    // so the grid ends exactly at endHour without an extra margin row.
    for (let hour = startHour; hour < endHour; hour++) {
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

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-slate-100 shadow-lg">
      <CalendarHeader
        selectedDate={selectedDate}
        weekStart={weekStart}
        shortId={shortId}
        onDateChange={onDateChange}
        eventDates={allEventDates}
      />

      {/* Calendar grid - scrollable */}
      <div className="flex flex-1 overflow-auto">
        <TimeColumn timeSlots={timeSlots} timeFormat={timeFormat} />

        {/* Days grid */}
        <div className="flex flex-1">
          {weekDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            return (
              <DayColumn
                key={dayStr}
                day={day}
                events={eventsByDay[dayStr] || []}
                timeSlots={timeSlots}
                startHour={startHour}
                endHour={endHour}
                timeFormat={timeFormat}
                selectedDate={selectedDate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
