'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ThemeControls from '@/components/ThemeControls';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { href: '/admin/elections', label: 'Elections', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { href: '/admin/candidates', label: 'Candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { href: '/admin/students', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: '/admin/results', label: 'Results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/admin/voting-booth', label: 'Voting Booth', icon: 'M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm4 8l2 2 4-4m-9 8h14' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out');
      router.push('/auth/login');
    } catch { toast.error('Logout failed'); }
  };

  return (
    <div className="admin-shell">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="sidebar-overlay lg-hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`admin-sidebar sidebar-desktop ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800 }} className="gradient-text">Smart Vote</h2>
            <p style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>Admin Panel</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <a key={item.href} href={item.href}
                onClick={(e) => { e.preventDefault(); router.push(item.href); setSidebarOpen(false); }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
                {isActive && <div className="sidebar-dot" />}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main main-with-sidebar">
        <header className="admin-topbar">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="sidebar-toggle btn btn-ghost" style={{ padding: '0.5rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeControls />
            <div className="admin-avatar">A</div>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>

      <style>{`
        .admin-shell { display: flex; min-height: 100vh; min-height: 100dvh; background: var(--slate-950); }

        /* Sidebar */
        .admin-sidebar {
          width: 260px; background: var(--slate-900); border-right: 1px solid var(--slate-800);
          display: flex; flex-direction: column; position: fixed; top: 0; bottom: 0;
          left: -260px; z-index: 50; transition: left 0.3s ease;
          overflow-y: auto; -webkit-overflow-scrolling: touch;
        }
        .admin-sidebar.open { left: 0; }
        .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40; }
        .sidebar-brand {
          padding: 1rem 1.25rem; border-bottom: 1px solid var(--slate-800);
          display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;
        }
        .sidebar-logo {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: linear-gradient(135deg, #059669, #10b981);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .sidebar-nav { flex: 1; padding: 0.75rem; display: flex; flex-direction: column; gap: 0.125rem; }
        .sidebar-link {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.625rem 0.875rem; border-radius: 0.5rem;
          font-size: 0.875rem; font-weight: 400; color: var(--slate-400);
          background: transparent; text-decoration: none; cursor: pointer;
          transition: all 0.2s; border: none; width: 100%; text-align: left;
          font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent;
        }
        .sidebar-link:hover { background: var(--slate-800); color: var(--slate-200); }
        .sidebar-link.active { font-weight: 600; color: var(--green-400); background: rgba(16, 185, 129, 0.1); }
        .sidebar-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--green-400);
          margin-left: auto; box-shadow: 0 0 8px var(--green-400);
        }
        .sidebar-footer { padding: 0.75rem; border-top: 1px solid var(--slate-800); }

        /* Main area */
        .admin-main { flex: 1; min-width: 0; transition: margin 0.3s; }
        .admin-topbar {
          height: 56px; background: var(--slate-900); backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--slate-800);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--page-px); position: sticky; top: 0; z-index: 30;
        }
        .admin-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, #059669, #10b981);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8125rem; font-weight: 700; color: white; flex-shrink: 0;
        }
        .admin-content {
          padding: var(--page-px);
          max-width: 1400px;
        }

        @media (min-width: 1024px) {
          .admin-sidebar { left: 0 !important; }
          .admin-main { margin-left: 260px !important; }
          .sidebar-toggle { display: none !important; }
          .lg-hidden { display: none !important; }
          .admin-topbar { height: 64px; }
        }
        @media (min-width: 1440px) {
          .admin-content { max-width: 1600px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
