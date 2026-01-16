import { format, isSameDay } from 'date-fns';

import CalendarEvent from './CalendarEvent';
import { HOUR_HEIGHT } from './constants';
import { calculateEventColumns } from './utils';

/**
 * Single day column showing the day header and events
 */
export default function DayColumn({ day, events, timeSlots, startHour, timeFormat, selectedDate }) {
  const isToday = isSameDay(day, new Date());
  const isSelected = isSameDay(day, selectedDate);
  const dayLayouts = calculateEventColumns(events);

  return (
    <div className="flex min-w-[85vw] flex-1 snap-start flex-col border-r border-slate-200 last:border-r-0 sm:min-w-[140px] sm:snap-align-none">
      {/* Day header - sticky */}
      <div
        className={`sticky top-0 z-10 flex h-14 flex-col items-center justify-center border-b border-slate-200 ${
          isToday ? 'bg-sky-100' : 'bg-white'
        }`}
      >
        <span className="text-xs font-medium text-slate-500 uppercase">{format(day, 'EEE')}</span>
        <span
          className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
            isToday ? 'text-sky-600' : isSelected ? 'bg-slate-300 text-slate-900' : 'text-slate-900'
          }`}
        >
          {format(day, 'd')}
        </span>
      </div>

      {/* Time slots with events - explicit height to prevent offset */}
      <div
        className={`relative ${isToday ? 'bg-slate-100/50' : ''}`}
        style={{ height: `${timeSlots.length * HOUR_HEIGHT}px` }}
      >
        {/* Grid lines */}
        {timeSlots.map((hour) => (
          <div
            key={hour}
            style={{ height: `${HOUR_HEIGHT}px` }}
            className={`border-b ${isToday ? 'border-slate-200 bg-sky-200/70' : 'border-slate-100'}`}
          />
        ))}

        {/* Events */}
        {events.map((event, idx) => (
          <CalendarEvent
            key={`${event.title}-${idx}`}
            event={event}
            layoutInfo={dayLayouts[idx] || { column: 0, totalColumns: 1 }}
            startHour={startHour}
            timeFormat={timeFormat}
          />
        ))}
      </div>
    </div>
  );
}
