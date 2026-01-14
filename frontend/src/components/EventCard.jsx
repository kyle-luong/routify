export default function EventCard({ event, timeFormat }) {
  const formatTime = (time) => {
    if (timeFormat === '24h') return time;
    const [hour, minute] = time.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  };

  const hasValidTime = event.start && event.end && event.start !== event.end;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-base font-medium text-slate-900">{event.title || 'Untitled Event'}</h3>
      {hasValidTime ? (
        <p className="text-sm text-slate-600">
          {formatTime(event.start)} – {formatTime(event.end)}
        </p>
      ) : null}

      {event.location && <p className="mt-1 text-sm text-slate-500">{event.location}</p>}
    </div>
  );
}
