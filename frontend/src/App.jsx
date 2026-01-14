import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import AboutPage from './pages/AboutPage';
import CalendarPage from './pages/CalendarPage';
import ContactPage from './pages/ContactPage';
import HelpPage from './pages/HelpPage';
import HomePage from './pages/HomePage';
import PrivacyPage from './pages/PrivacyPage';
import SchedulePage from './pages/SchedulePage';
import TermsPage from './pages/TermsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
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
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
