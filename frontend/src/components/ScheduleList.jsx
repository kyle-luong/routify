import EventCard from './EventCard';

export default function ScheduleList({ events, timeFormat, commuteTimes }) {
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
          const commuteInfo = commuteTimes?.[i];
          return (
            <div key={i} className="">
              <EventCard event={event} timeFormat={timeFormat} />
              {i < events.length - 1 && (
                <div className="my-3 flex items-center px-1 text-sm text-slate-500">
                  <div className="h-px flex-grow bg-slate-200" />
                  {showCommuteText && commuteInfo?.duration_text && (
                    <span className="mx-2">Commute: {commuteInfo.duration_text}</span>
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
