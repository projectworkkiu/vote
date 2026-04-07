'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function VotingBoothPage() {
  const [boothUrl, setBoothUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{ totalStudents: number; totalVoted: number; activeElections: number } | null>(null);

  useEffect(() => {
    // Build the booth URL from the current origin
    setBoothUrl(`${window.location.origin}/booth`);

    // Fetch quick stats
    fetch('/api/dashboard/stats')
      .then(r => r.json())
      .then(data => {
        setStats({
          totalStudents: data.totalStudents || 0,
          totalVoted: data.totalVotes || 0,
          activeElections: data.activeElections || 0,
        });
      })
      .catch(() => {});
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(boothUrl);
      setCopied(true);
      toast.success('Voting booth link copied!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = boothUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Voting booth link copied!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          🗳️ Voting Booth
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
          Share the voting booth link with students so they can vote from their own devices simultaneously.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Shareable Link Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="card"
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--slate-800)',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-200)' }}>Shareable Voting Link</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Send this to students — they can all vote at the same time</p>
            </div>
          </div>

          {/* URL Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'var(--slate-800)',
            borderRadius: '0.5rem',
            border: '1px solid var(--slate-700)',
            marginBottom: '1rem',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--slate-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <code style={{
              flex: 1,
              fontSize: '0.875rem',
              color: 'var(--green-400)',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {boothUrl || 'Loading...'}
            </code>
            <motion.button
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: copied ? 'var(--green-500)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontFamily: 'Inter, sans-serif',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              {copied ? (
                <>✅ Copied!</>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </motion.button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => window.open(boothUrl, '_blank')}
              style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              🔗 Open in New Tab
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                const subject = encodeURIComponent('Vote Now — Smart Vote');
                const body = encodeURIComponent(`Hi!\n\nYou can cast your vote using the link below:\n\n${boothUrl}\n\nLog in with your Student ID and password to access the ballot.\n\nHappy voting! 🗳️`);
                window.open(`mailto:?subject=${subject}&body=${body}`);
              }}
              style={{ flex: 1 }}
            >
              📧 Share via Email
            </button>
          </div>
        </motion.div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Live Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="card"
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-200)' }}>
                📊 Live Voting Stats
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{stats.totalStudents}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>Students</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-400)' }}>{stats.totalVoted}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>Votes Cast</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{stats.activeElections}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 500 }}>Active</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--slate-200)' }}>
              📋 How It Works
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { step: '1', title: 'Share the Link', desc: 'Copy and send the booth link to students via email, messaging apps, or notice boards.' },
                { step: '2', title: 'Students Sign In', desc: 'Each student opens the link on their own device and signs in with their ID & password.' },
                { step: '3', title: 'Cast Ballots', desc: 'Students vote independently and simultaneously — no queuing or bottlenecks.' },
                { step: '4', title: 'Results Update Live', desc: 'Votes are recorded in real-time. View results from the Results page.' },
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    minWidth: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #059669, #10b981)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-200)', marginBottom: '0.125rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Note */}
            <div style={{
              marginTop: '1.25rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
            }}>
              <span style={{ fontSize: '0.875rem' }}>🔒</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', lineHeight: 1.6 }}>
                Each student can only vote <strong>once per election</strong>. Votes are anonymous and encrypted. 
                Students can only access the voting ballot — they cannot see admin pages, settings, or results.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
