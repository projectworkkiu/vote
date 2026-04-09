'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThemeControls() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <button onClick={() => router.back()} className="btn btn-sm btn-ghost" style={{ padding: '0.4rem' }} title="Go Back">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <button onClick={() => router.forward()} className="btn btn-sm btn-ghost" style={{ padding: '0.4rem' }} title="Go Forward">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
      <button onClick={toggleTheme} className="btn btn-sm btn-secondary" style={{ padding: '0.4rem 0.6rem', borderRadius: '2rem' }} title="Toggle Theme">
        <span className="theme-label">{isDark ? '☀️ Light' : '🌙 Dark'}</span>
        <span className="theme-icon">{isDark ? '☀️' : '🌙'}</span>
      </button>
      <style>{`
        .theme-icon { display: none; }
        @media (max-width: 639px) {
          .theme-label { display: none; }
          .theme-icon { display: inline; }
        }
      `}</style>
    </div>
  );
}
