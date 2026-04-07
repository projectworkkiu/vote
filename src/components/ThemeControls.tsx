'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThemeControls() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      document.documentElement.classList.add('light-mode');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button 
        onClick={() => router.back()} 
        className="btn btn-sm btn-ghost" 
        style={{ padding: '0.5rem' }}
        title="Go Back"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </button>

      <button 
        onClick={() => router.forward()} 
        className="btn btn-sm btn-ghost" 
        style={{ padding: '0.5rem' }}
        title="Go Forward"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>

      <button 
        onClick={toggleTheme} 
        className="btn btn-sm btn-secondary" 
        style={{ padding: '0.4rem 0.6rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        title="Toggle Theme"
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}
