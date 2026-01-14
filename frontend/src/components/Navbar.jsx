import { useLocation } from 'react-router-dom';

import ViewToggle from './ViewToggle';

export default function Navbar() {
  const location = useLocation();

  // Extract short_id from pathname (e.g., /view/abc123 or /view/abc123/calendar)
  const viewMatch = location.pathname.match(/^\/view\/([^/]+)/);
  const short_id = viewMatch ? viewMatch[1] : null;

  // Determine if we're on a schedule view page
  const isSchedulePage = !!short_id;
  const isCalendarView = location.pathname.endsWith('/calendar');

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <a href="/" className="text-xl font-semibold text-slate-900">
          Routify
        </a>

        <div className="flex items-center gap-6">
          {/* View toggle - pill switch style */}
          {isSchedulePage && (
            <ViewToggle shortId={short_id} active={isCalendarView ? 'calendar' : 'list'} />
          )}

          <nav className="hidden space-x-6 text-base text-slate-600 md:flex">
            <a href="/about" className="hover:text-slate-900">
              About
            </a>
            <a href="/help" className="hover:text-slate-900">
              Help
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
