import { lazy, Suspense } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

// Eagerly load main pages
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';

// Lazy load secondary pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/view/:short_id" element={<SchedulePage />} />
              <Route path="/view/:short_id/calendar" element={<CalendarPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
