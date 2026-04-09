'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ThemeControls from '@/components/ThemeControls';

export default function VoteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    router.push('/booth');
  };

  return (
    <div style={{ minHeight: '100vh', minBlockSize: '100dvh', background: 'var(--slate-950)' }}>
      <header className="vote-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, #059669, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
          </div>
          <h1 style={{ fontSize: '1rem', fontWeight: 800 }} className="gradient-text">Smart Vote</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ThemeControls />
          <button onClick={() => router.push('/vote/settings')} className="btn btn-sm btn-ghost" title="Settings" style={{ padding: '0.5rem' }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button onClick={handleLogout} className="btn btn-sm btn-ghost">Logout</button>
        </div>
      </header>
      <main style={{ padding: 'var(--page-px)', maxWidth: '1000px', margin: '0 auto' }}>{children}</main>

      <style>{`
        .vote-topbar {
          height: 56px; background: var(--slate-900); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--slate-800);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--page-px); position: sticky; top: 0; z-index: 30;
        }
        @media (min-width: 1024px) {
          .vote-topbar { height: 64px; }
        }
      `}</style>
    </div>
  );
}
