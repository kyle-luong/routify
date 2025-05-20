import { useState } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { FaBicycle, FaCar, FaWalking } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import 'react-day-picker/dist/style.css';

export default function ScheduleHeader({
  selectedDate,
  setSelectedDate,
  timeFormat,
  setTimeFormat,
  transportMode,
  setTransportMode,
  eventDates = [],
}) {
  const [showCalendar, setShowCalendar] = useState(false);

  const eventDateStrings = eventDates.map((d) => parseISO(d).toDateString());

  return (
    <div className="relative z-10 w-full">
      {/* Controls Row */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        {/* Date Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="rounded-md bg-slate-200 px-2 py-1 text-sm hover:bg-slate-300"
          >
            <FiChevronLeft className="text-sky-600" />
          </button>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            {format(selectedDate, 'EEE MMM d')}
          </button>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="rounded-md bg-slate-200 px-2 py-1 text-sm hover:bg-slate-300"
          >
            <FiChevronRight className="text-sky-600" />
          </button>
        </div>

        <h2 className="text-xl font-bold whitespace-nowrap text-slate-900">Schedule</h2>

        {/* Format + Transport */}
        <div className="flex space-x-2">
          <div className="flex space-x-1 rounded-md bg-slate-100 px-2 py-1">
            {[
              ['walking', <FaWalking />],
              ['biking', <FaBicycle />],
              ['driving', <FaCar />],
            ].map(([mode, icon]) => (
              <button
                key={mode}
                onClick={() => setTransportMode(mode)}
                className={`text-sm ${transportMode === mode ? 'text-sky-600' : 'text-slate-500'}`}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="flex space-x-1 rounded-md bg-slate-100 px-2 py-1">
            {['12h', '24h'].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setTimeFormat(fmt)}
                className={`px-1 text-sm ${timeFormat === fmt ? 'text-sky-600' : 'text-slate-500'}`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Overlay */}
      {showCalendar && (
        <div className="absolute top-[40px] z-50 rounded-lg border border-slate-200 bg-white p-4 shadow-md">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
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
          />
        </div>
      )}
    </div>
  );
}
