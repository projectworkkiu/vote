'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const CANDIDATE_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
];

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

interface PositionResult {
  position: string;
  positionId: string;
  candidates: Array<{ id: string; name: string; votes: number }>;
}

export default function VotePage() {
  const router = useRouter();
  const [elections, setElections] = useState<Election[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveResults, setLiveResults] = useState<Record<string, { results: PositionResult[]; totalVoters: number; election: any }>>({});

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      const r = await fetch('/api/student/dashboard');
      const data = await r.json();
      setElections(data.elections || []);
      setStats(data.stats || null);
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, []);

  // Fetch live results for active elections
  const fetchLiveResults = useCallback(async () => {
    const activeElections = elections.filter(e => e.status === 'ACTIVE' || e.status === 'CLOSED');
    for (const el of activeElections) {
      try {
        const res = await fetch(`/api/results/${el.id}`);
        const data = await res.json();
        if (data && !data.error) {
          setLiveResults(prev => ({ ...prev, [el.id]: { results: data.results, totalVoters: data.totalVoters, election: data.election } }));
        }
      } catch {}
    }
  }, [elections]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { if (elections.length > 0) fetchLiveResults(); }, [elections.length, fetchLiveResults]);

  // Poll every 30s instead of 5s to save heavy battery and CPU loops on low end phones
  useEffect(() => {
    const iv = setInterval(() => {
      fetchDashboard(true);
      fetchLiveResults();
    }, 30000);
    return () => clearInterval(iv);
  }, [fetchDashboard, fetchLiveResults]);

  const getTimeLeft = (endDate: string) => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
    return `${h}h ${m}m left`;
  };

  const isElectionEnded = (el: Election) => {
    return el.status === 'CLOSED' || new Date() > new Date(el.end_date);
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      {/* Stats Banner */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-glass" 
          style={{ marginBottom: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1.5rem', textAlign: 'center', padding: '1.5rem' }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {elections.map((el, i) => {
            const live = liveResults[el.id];
            const ended = isElectionEnded(el);

            return (
              <motion.div
                key={el.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Election card */}
                <div
                  className={`card ${el.hasVoted ? 'voted-locked' : ''}`}
                  style={{ 
                    cursor: el.hasVoted ? 'default' : 'pointer', 
                    position: 'relative', overflow: 'hidden',
                    opacity: el.hasVoted ? 0.9 : 1,
                    border: el.hasVoted ? '1px solid var(--slate-800)' : '1px solid var(--slate-700)',
                  }}
                  onClick={() => !el.hasVoted && router.push(`/vote/${el.id}`)}
                >
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px', 
                    background: el.hasVoted ? 'var(--slate-700)' : 'linear-gradient(90deg, var(--green-500), var(--green-400))' 
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: el.hasVoted ? 'var(--slate-300)' : 'inherit' }}>{el.title}</h3>
                    {ended ? (
                      <span className="badge badge-gray" style={{ textTransform: 'uppercase' }}>
                        {el.hasVoted ? 'VOTED ✅' : 'ENDED'}
                      </span>
                    ) : (
                      <span className="badge badge-green pulse-green" style={{ textTransform: 'uppercase' }}>
                        {el.hasVoted ? 'VOTED ✅' : `ONGOING (${getTimeLeft(el.end_date)})`}
                      </span>
                    )}
                  </div>
                  
                  <p style={{ color: 'var(--slate-400)', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {el.description || 'No description'}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {el.positions?.length || 0} positions
                    </span>
                    {!el.hasVoted && <span className="btn btn-sm btn-primary">Vote Now →</span>}
                  </div>
                </div>

                {/* Live results for this election (visible to all students for transparency) */}
                {live && live.results.length > 0 && (
                  <div className="card" style={{ marginTop: '0.5rem', padding: '1rem', border: '1px solid var(--slate-800)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--slate-200)' }}>
                        📊 Live Results — {live.totalVoters} voter{live.totalVoters !== 1 ? 's' : ''}
                      </h4>
                      <span className="badge badge-green pulse-green" style={{ fontSize: '0.65rem' }}>● LIVE</span>
                    </div>

                    {live.results.map((pos) => {
                      const totalVotes = pos.candidates.reduce((s, c) => s + c.votes, 0);
                      const maxVotes = pos.candidates.length > 0 ? pos.candidates[0].votes : 0;
                      const isTie = pos.candidates.filter(c => c.votes === maxVotes && maxVotes > 0).length > 1;

                      return (
                        <div key={pos.positionId} style={{ marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-300)' }}>{pos.position}</span>
                            {ended && maxVotes > 0 && (
                              <span className={`badge ${isTie ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                                {isTie ? '🤝 TIE' : `🏆 ${pos.candidates[0].name}`}
                              </span>
                            )}
                            {!ended && <span className="badge badge-yellow" style={{ fontSize: '0.65rem' }}>⏳ In progress</span>}
                          </div>

                          {/* Candidate bars */}
                          {pos.candidates.map((c, ci) => {
                            const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                            return (
                              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', minWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                <div style={{ flex: 1, height: '16px', background: 'var(--slate-800)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                  <div
                                    style={{ 
                                      height: '100%', 
                                      background: CANDIDATE_COLORS[ci % CANDIDATE_COLORS.length], 
                                      borderRadius: '4px',
                                      width: `${pct}%`,
                                      transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: CANDIDATE_COLORS[ci % CANDIDATE_COLORS.length], minWidth: '45px', textAlign: 'right' }}>{c.votes} ({pct}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
