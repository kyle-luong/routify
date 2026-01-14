import EventCard from './EventCard';

export default function ScheduleList({ events, timeFormat }) {
  return (
    <div className="h-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {events.length == 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-slate-500">No events for this day.</p>
        </div>
      ) : (
        events.map((event, i) => {
          const next = events[i + 1];
          const currHasFull = event && event.start && event.end && event.location;
          const nextHasFull = next && next.start && next.end && next.location;
          const showCommuteText = currHasFull && nextHasFull;
          return (
            <div key={i} className="">
              <EventCard event={event} timeFormat={timeFormat} />
              {i < events.length - 1 && (
                <div className="my-3 flex items-center px-1 text-sm text-slate-500">
                  <div className="h-px flex-grow bg-slate-200" />
                  {showCommuteText && (
                    <span className="mx-2">Commute: ~{Math.floor(Math.random() * 10) + 5} min</span>
                  )}
                  <div className="h-px flex-grow bg-slate-200" />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
