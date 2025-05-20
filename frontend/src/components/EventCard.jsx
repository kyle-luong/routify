export default function EventCard({ event, timeFormat }) {
  const formatTime = (time) => {
    if (timeFormat === '24h') return time;
    const [hour, minute] = time.split(':').map(Number);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = ((hour + 11) % 12) + 1;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-medium text-slate-900">{event.title || 'Untitled Event'}</h3>
      <p className="text-sm text-slate-600">
        {formatTime(event.start)} – {formatTime(event.end)}
      </p>
      {event.location && <p className="mt-1 text-sm text-slate-500">{event.location}</p>}
    </div>
  );
}
