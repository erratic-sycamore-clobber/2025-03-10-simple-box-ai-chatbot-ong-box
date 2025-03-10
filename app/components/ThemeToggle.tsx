'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // Initialize theme state from localStorage or system preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    // Ensure our state matches the actual theme in the document
    setIsDark(shouldBeDark);
    
    // Also initialize the document theme (should match BootstrapClient)
    document.documentElement.setAttribute('data-bs-theme', shouldBeDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    
    // Update DOM and localStorage
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    
    // Store theme in localStorage
    localStorage.setItem('theme', newTheme);
    
    // Dispatch storage event for other components to react to
    // (This helps with cross-component communication)
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: newTheme
    }));
  };

  return (
    <button 
      onClick={toggleTheme}
      className="btn btn-link text-body p-0 d-flex align-items-center justify-content-center"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <i className="bi bi-sun-fill fs-5"></i>
      ) : (
        <i className="bi bi-moon-fill fs-5"></i>
      )}
    </button>
  );
}