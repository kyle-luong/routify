import { formatTime, getEventColor, getEventStyle } from './utils';

/**
 * Single event card displayed on the calendar
 */
export default function CalendarEvent({ event, layoutInfo, startHour, timeFormat }) {
  const style = getEventStyle(event, startHour, layoutInfo);
  const colorClass = getEventColor(event);
  const hasValidTime = event.start && event.end && event.start !== event.end;

  return (
    <div
      className={`absolute overflow-hidden rounded-lg px-1.5 py-1 text-xs shadow-sm transition-shadow duration-200 hover:shadow-md ${colorClass}`}
      style={style}
      title={`${event.title}\n${hasValidTime ? `${formatTime(event.start, timeFormat)} - ${formatTime(event.end, timeFormat)}\n` : ''}${event.location || ''}`}
    >
      <div className="font-small leading-tight">
        {hasValidTime
          ? `${formatTime(event.start, timeFormat)} - ${formatTime(event.end, timeFormat)}`
          : ''}
      </div>
      <div className="mt-px truncate leading-tight font-bold">{event.title}</div>
      {event.location && (
        <div className="font-small mt-px text-[11px] leading-tight text-slate-700">
          {event.location}
        </div>
      )}
    </div>
  );
}
