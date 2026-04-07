'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface Election {
  id: string; title: string; description: string; start_date: string; end_date: string; status: string;
  hasVoted?: boolean;
  positions?: Array<{ id: string; name: string; candidates?: any[] }>;
}

interface Stats {
  totalStudents: number;
  totalBallots: number;
  turnoutPercentage: number;
}

export default function VotePage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard')
      .then(r => r.json())
      .then((data) => {
        setElections(data.elections || []);
        setStats(data.stats || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTimeLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
    return `${h}h ${m}m left`;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      {/* Lively Stats Banner */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass" 
          style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', textAlign: 'center', padding: '1.5rem' }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 600 }}>Total Ballots Cast</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-400)' }}>{stats.totalBallots}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--slate-800)', borderRight: '1px solid var(--slate-800)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 600 }}>Voter Turnout</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-400)' }}>{stats.turnoutPercentage}%</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-400)', fontWeight: 600 }}>Live Update</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-200)', marginTop: '0.5rem' }}>
              <span className="badge badge-green pulse-green">● REALTIME</span>
            </div>
          </div>
        </motion.div>
      )}

      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>🗳️ Active Elections</h1>
        <p style={{ color: 'var(--slate-400)' }}>Make your voice heard. Every vote counts.</p>
      </div>

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
          <p style={{ color: 'var(--slate-500)' }}>No active elections at the moment</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {elections.map((el, i) => (
            <motion.div
              key={el.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`card ${el.hasVoted ? 'voted-locked' : ''}`}
              style={{ 
                cursor: el.hasVoted ? 'default' : 'pointer', 
                position: 'relative', 
                overflow: 'hidden',
                opacity: el.hasVoted ? 0.8 : 1,
                border: el.hasVoted ? '1px solid var(--slate-800)' : '1px solid var(--slate-700)'
              }}
              onClick={() => !el.hasVoted && router.push(`/vote/${el.id}`)}
            >
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px', 
                background: el.hasVoted ? 'var(--slate-700)' : 'linear-gradient(90deg, var(--green-500), var(--green-400))' 
              }} />
              
              {el.hasVoted && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, pointerEvents: 'none' }}>
                   <div style={{ padding: '0.5rem 1rem', background: 'var(--slate-900)', border: '2px solid var(--green-500)', borderRadius: '2rem', color: 'var(--green-500)', fontWeight: 800, transform: 'rotate(-10deg)', fontSize: '1.25rem' }}>COMPLETED</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: el.hasVoted ? 'var(--slate-500)' : 'inherit' }}>{el.title}</h3>
                {el.status === 'ACTIVE' && !el.hasVoted ? (
                  <span className="badge badge-green pulse-green">{getTimeLeft(el.end_date)}</span>
                ) : (
                  <span className={`badge ${el.status === 'CLOSED' ? 'badge-gray' : 'badge-green'}`}>
                    {el.hasVoted ? 'SUCCESS' : el.status}
                  </span>
                )}
              </div>
              
              <p style={{ color: 'var(--slate-400)', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                {el.description || 'No description'}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {el.positions?.length || 0} positions
                </span>
                {el.hasVoted ? (
                  <span style={{ color: 'var(--green-500)', fontWeight: 700, fontSize: '0.875rem' }}>Already Voted ✅</span>
                ) : (
                  <span className="btn btn-sm btn-primary">Vote Now →</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
