import { useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import 'react-day-picker/dist/style.css';

import ShareableLink from '../ShareableLink';

const calendarStyles = `
  .selected-day {
    background-color: #0ea5e9 !important;
    color: white !important;
    font-weight: bold;
  }
  .selected-day:hover {
    background-color: #0284c7 !important;
  }
  .today-day {
    background-color: #f1f5f9;
    font-weight: bold;
  }
  .has-events {
    position: relative;
  }
  .has-events::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    transform: translateX(-50%);
    width: 4px;
    height: 4px;
    background-color: #0ea5e9;
    border-radius: 50%;
  }
`;

/**
 * Calendar header with navigation controls, month/year title, and share link
 */
export default function CalendarHeader({
  selectedDate,
  weekStart,
  shortId,
  onDateChange,
  eventDates = [],
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const eventDateStrings = (eventDates || []).map((d) => parseISO(d).toDateString());

  return (
    <div className="relative z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
      <style>{calendarStyles}</style>
      {/* Left: Navigation */}      <div className="relative flex items-center">
        <button
          onClick={goToPrevWeek}
           className="rounded-lg p-2 text-slate-400 hover:text-sky-600"
          aria-label="Previous week"
        >
          <FiChevronLeft className="h-7 w-7" />
        </button>
        <button
          onClick={goToNextWeek}
          className="rounded-lg p-2 text-slate-400 hover:text-sky-600"
          aria-label="Next week"
        >
          <FiChevronRight className="h-7 w-7" />
        </button>
        <button
          onClick={goToToday}
          className="mx-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-sky-600"
        >
          Today
        </button>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="ml-2 rounded-lg border border-slate-300 p-2 text-slate-500 hover:text-sky-600 text-sm"
          title="Pick a date"
        >
          <FiCalendar className="h-4 w-4" />
        </button>

        {/* Date picker dropdown (rich overlay like ScheduleHeader) */}
        {showDatePicker && (
          <div className="absolute top-[40px] left-0 z-[120] rounded-lg border border-slate-200 bg-white p-4 shadow-md">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              showOutsideDays
              weekStartsOn={0}
              modifiers={{
                hasEvents: (day) => eventDateStrings.includes(day.toDateString()),
              }}
              modifiersClassNames={{
                hasEvents: 'has-events',
                selected: 'selected-day',
                today: 'today-day',
              }}
              components={{
                PreviousMonthButton: (props) => (
                  <button {...props} className="rounded-md p-1 hover:bg-slate-200">
                    <FiChevronLeft className="text-xl text-sky-600" />
                  </button>
                ),
                NextMonthButton: (props) => (
                  <button {...props} className="rounded-md p-1 hover:bg-slate-200">
                    <FiChevronRight className="text-xl text-sky-600" />
                  </button>
                ),
              }}
              className="text-sm"
            />
          </div>
        )}
      </div>

      {/* Center: Month Year */}
      <h2 className="text-xl font-semibold text-slate-800">{format(weekStart, 'MMMM yyyy')}</h2>

      {/* Right: Share Link */}
      <div className="flex items-center">{shortId && <ShareableLink shortId={shortId} />}</div>
    </div>
  );
}
