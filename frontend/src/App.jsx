import './styles/index.css';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx'
import SchedulePage from "./pages/SchedulePage";

function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
            {/* root page directs to home page */}
            <Route path="/" element={<HomePage />} />
            <Route path="/view/:short_id" element={<SchedulePage />} />                        
          </Routes>
        </Router>
    </div>
  );
}

export default App;