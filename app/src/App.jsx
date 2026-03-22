import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Assets
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';

// Pages
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewSessionPage from './pages/InterviewSessionPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="App">
            <p>This is an app.</p>
          </div>
        } />
        <Route path="/setup" element={<InterviewSetupPage />} />
        <Route path="/session/:id" element={<InterviewSessionPage />} />
      </Routes>
    </Router>
  );
}

export default App;