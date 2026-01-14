import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage';
import SchedulePage from './pages/SchedulePage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view/:short_id" element={<SchedulePage />} />
          <Route path="/view/:short_id/calendar" element={<CalendarPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
