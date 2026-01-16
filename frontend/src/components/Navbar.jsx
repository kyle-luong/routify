import { FiCalendar, FiMap } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

import { getSession } from '../lib/session';

export default function Navbar() {
  const location = useLocation();
  const savedSession = getSession();

  // Extract short_id from pathname (e.g., /view/abc123 or /view/abc123/calendar)
  const viewMatch = location.pathname.match(/^\/view\/([^/]+)/);
  const currentShortId = viewMatch ? viewMatch[1] : null;

  // Use current page's short_id if on a view page, otherwise use saved session
  const activeSession = currentShortId || savedSession;

  // Determine current view type
  const isOnMapView = currentShortId && !location.pathname.endsWith('/calendar');
  const isOnCalendarView = currentShortId && location.pathname.endsWith('/calendar');

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-3 sm:h-14 sm:px-4 md:px-6">
        {/* Left side: Logo + About/Help */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="text-base font-semibold text-slate-900 sm:text-lg">
            calview
          </Link>

          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Link
              to="/about"
              className={`px-2 py-1 text-xs font-medium transition sm:px-3 sm:py-1.5 sm:text-sm ${
                location.pathname === '/about'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              About
            </Link>
            <Link
              to="/help"
              className={`px-2 py-1 text-xs font-medium transition sm:px-3 sm:py-1.5 sm:text-sm ${
                location.pathname === '/help'
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Help
            </Link>
          </nav>
        </div>

        {/* Right side: Map/Calendar toggle */}
        {activeSession && (
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Link
              to={`/view/${activeSession}`}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-sm ${
                isOnMapView ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiMap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Map</span>
            </Link>
            <Link
              to={`/view/${activeSession}/calendar`}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition sm:gap-1.5 sm:px-4 sm:py-1.5 sm:text-sm ${
                isOnCalendarView ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiCalendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Calendar</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
