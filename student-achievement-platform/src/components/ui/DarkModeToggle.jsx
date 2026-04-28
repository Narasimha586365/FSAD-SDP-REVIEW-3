import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../../styles/DarkMode.css';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  return (
    <motion.button
      type="button"
      className="dark-mode-toggle"
      onClick={() => setDarkMode((current) => !current)}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Light mode' : 'Dark mode'}
    >
      {darkMode ? '☀' : '🌙'}
    </motion.button>
  );
};

export default DarkModeToggle;
