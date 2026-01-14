import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FiCalendar, FiList } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function ViewToggle({ shortId, active = 'list' }) {
  if (!shortId) return null;

  const isCalendarView = active === 'calendar';
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const calendarRef = useRef(null);
  const [indicator, setIndicator] = useState({ width: 0, left: 0 });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    const target = (isCalendarView ? calendarRef : listRef).current;
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    setIndicator({
      width: targetRect.width,
      left: targetRect.left - containerRect.left,
    });
  }, [isCalendarView]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, shortId]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center rounded-full bg-slate-100 p-1"
    >
      <span
        className="absolute top-1 bottom-1 rounded-full bg-white shadow-sm transition-all duration-200 ease-out"
        style={{
          left: `${indicator.left}px`,
          width: indicator.width ? `${indicator.width}px` : undefined,
        }}
      />
      <Link
        ref={listRef}
        to={`/view/${shortId}`}
        className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !isCalendarView ? 'text-slate-900' : 'text-slate-500'
        }`}
      >
        <FiList className="h-4 w-4" />
        List
      </Link>
      <Link
        ref={calendarRef}
        to={`/view/${shortId}/calendar`}
        className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          isCalendarView ? 'text-slate-900' : 'text-slate-500'
        }`}
      >
        <FiCalendar className="h-4 w-4" />
        Calendar
      </Link>
    </div>
  );
}
