// This file is the entry point for the React application.
// It initializes the React application and renders the main App component into the root element of the HTML document.
import './styles/index.css';
import './styles/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage.jsx'
import SchedulePage from "./pages/SchedulePage.jsx";

function App() {
  return (
    <div className="App">
      <div>Hello, world!</div>
    <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view/:short_id" element={<SchedulePage />} />
        </Routes>
      </Router>
    </div>
  );
}


export default App;