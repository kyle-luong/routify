import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiMap } from 'react-icons/fi';

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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="text-xl font-semibold text-slate-900">
          Routify
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {/* Schedule navigation - only show if user has a session */}
          {activeSession && (
            <>
              <Link
                to={`/view/${activeSession}`}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isOnMapView
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FiMap className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </Link>
              <Link
                to={`/view/${activeSession}/calendar`}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isOnCalendarView
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <FiCalendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Link>
              <div className="mx-2 h-5 w-px bg-slate-200" />
            </>
          )}

          <Link
            to="/about"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              location.pathname === '/about'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            About
          </Link>
          <Link
            to="/help"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              location.pathname === '/help'
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            Help
          </Link>
        </nav>
      </div>
    </header>
  );
}
