import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutPage } from './pages/AboutPage';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kyc_theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('kyc_theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('kyc_theme', 'light');
    }
  }, [darkMode]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/dashboard" element={<DashboardPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/about" element={<AboutPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
