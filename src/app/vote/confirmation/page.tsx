'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out successfully');
      router.push('/booth');
    } catch {
      router.push('/booth');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card"
      style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '4rem auto' }}
    >
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem', color: 'var(--green-400)'
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--slate-50)' }}>Vote Cast Successfully!</h1>
      <p style={{ color: 'var(--slate-400)', fontSize: '1rem', marginBottom: '2rem' }}>
        Your vote has been securely and anonymously recorded.
      </p>

      {token && (
        <div style={{ background: 'var(--slate-900)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--slate-800)', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>Your anonymous receipt token:</p>
          <code style={{ fontSize: '1.25rem', color: 'var(--green-400)', fontWeight: 700, letterSpacing: '2px' }}>{token}</code>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={handleSignOut}>
          ✅ Done — Sign Out
        </button>
        <button className="btn btn-ghost" onClick={() => router.push('/vote')}>
          View Other Elections
        </button>
      </div>
    </motion.div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="spinner spinner-lg" style={{ margin: '4rem auto', display: 'block' }} />}>
      <ConfirmationContent />
    </Suspense>
  );
}

