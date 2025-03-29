import './styles/index.css';
import './styles/App.css';
import HomePage from './pages/HomePage.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
          <Routes>
            {/* root page directs to home page */}
            <Route path="/" element={<HomePage />} />                        
          </Routes>
        </Router>
    </div>
  );
}

export default App;