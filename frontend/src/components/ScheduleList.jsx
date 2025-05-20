import EventCard from './EventCard';

export default function ScheduleList({ events, timeFormat }) {
  return (
    <div className="h-full space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {events.length == 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-slate-500">No events for this day.</p>
        </div>
      ) : (
        events.map((event, i) => (
          <div key={i} className="space-y-2">
            <EventCard event={event} timeFormat={timeFormat} />
            {i < events.length - 1 && (
              <div className="flex items-center px-1 text-sm text-slate-500">
                <div className="h-px flex-grow bg-slate-200" />
                <span className="mx-2">Commute: ~{Math.floor(Math.random() * 10) + 5} min</span>
                <div className="h-px flex-grow bg-slate-200" />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
