import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Interview from './pages/Interview';
import Report from './pages/Report';
import { InterviewProvider } from './context/InterviewContext';

function App() {
  return (
    <Router>
      <InterviewProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </InterviewProvider>
    </Router>
  );
}

export default App;
