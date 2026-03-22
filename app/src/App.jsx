import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


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