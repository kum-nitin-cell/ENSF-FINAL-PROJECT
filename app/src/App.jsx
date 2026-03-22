import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Assets
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';

// Pages
import InterviewSetupPage from './pages/InterviewSetupPage';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <Routes>
        {/* Your default Vite template acts as the home page for now */}
        <Route path="/" element={
          <div className="App">
            <p>This is an app.</p>
          </div>
        } />

        {/* Your new setup route! */}
        <Route path="/setup" element={<InterviewSetupPage />} />
      </Routes>
    </Router>
  );
}

export default App;