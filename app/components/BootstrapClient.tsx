'use client';

import { useEffect } from 'react';

export default function BootstrapClient() {
  useEffect(() => {
    // Import Bootstrap JS
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
    
    // Check for saved theme preference or use system preference
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
      }
    };
    
    // Initial theme application
    applyTheme();
    
    // Listen for theme changes in localStorage
    window.addEventListener('storage', (event) => {
      if (event.key === 'theme') {
        applyTheme();
      }
    });
    
    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-bs-theme', event.matches ? 'dark' : 'light');
      }
    });
  }, []);

  return null;
}