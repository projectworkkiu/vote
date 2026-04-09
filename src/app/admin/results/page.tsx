'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const CANDIDATE_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
];

interface Result {
  position: string;
  positionId: string;
  candidates: Array<{ id: string; name: string; photo: string | null; votes: number }>;
}

interface ElectionMeta {
  id: string; title: string; status: string; startDate: string; endDate: string;
}

export default function ResultsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [electionMeta, setElectionMeta] = useState<ElectionMeta | null>(null);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetch('/api/elections').then(r => r.json())
      .then(data => setElections(Array.isArray(data) ? data : []))
      .catch(() => setElections([]));
  }, []);

  const fetchResults = useCallback(async (silent = false) => {
    if (!selectedElection) return;
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/results/${selectedElection}`);
      const data = await res.json();
      if (data && !data.error) {
        setResults(data.results || []);
        setTotalVoters(data.totalVoters || 0);
        setElectionMeta(data.election || null);
        setLastUpdated(new Date());
      }
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, [selectedElection]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  // Real-time polling every 5s
  useEffect(() => {
    if (!selectedElection) return;
    const iv = setInterval(() => fetchResults(true), 5000);
    return () => clearInterval(iv);
  }, [selectedElection, fetchResults]);

  const isElectionEnded = () => {
    if (!electionMeta) return false;
    return electionMeta.status === 'CLOSED' || new Date() > new Date(electionMeta.endDate);
  };

  const getWinnerLabel = (candidates: Result['candidates']) => {
    if (!isElectionEnded()) return null;
    if (candidates.length === 0) return null;
    const maxVotes = candidates[0].votes;
    if (maxVotes === 0) return null;
    const topCandidates = candidates.filter(c => c.votes === maxVotes);
    if (topCandidates.length > 1) return `🤝 TIE (${topCandidates.map(c => c.name).join(' & ')})`;
    return `🏆 Winner: ${topCandidates[0].name}`;
  };

  const exportCSV = () => {
    let csv = 'Position,Candidate,Votes\n';
    results.forEach(r => { r.candidates.forEach(c => { csv += `${r.position},${c.name},${c.votes}\n`; }); });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'election-results.csv'; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Results & Analytics</h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
            View election results and analytics
            {lastUpdated && selectedElection && (
              <span style={{ marginLeft: '0.5rem' }}>
                — <span className="badge badge-green pulse-green" style={{ fontSize: '0.7rem' }}>● LIVE</span>
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select className="input" style={{ width: 'auto', minWidth: '200px' }} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">Select Election</option>
            {elections.map(el => <option key={el.id} value={el.id}>{el.title} ({el.status})</option>)}
          </select>
          {results.length > 0 && <button className="btn btn-secondary" onClick={exportCSV}>📥 Export CSV</button>}
        </div>
      </div>

      {!selectedElection ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
          <p style={{ color: 'var(--slate-500)' }}>Select an election to view results</p>
        </div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--slate-500)' }}>No votes recorded yet</p>
        </div>
      ) : (
        <div>
          {/* Summary */}
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div><span style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>Total Voters</span><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-400)' }}>{totalVoters}</p></div>
            <div><span style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>Positions</span><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--info)' }}>{results.length}</p></div>
            <div><span style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>Status</span><p style={{ fontSize: '1.25rem', fontWeight: 800, color: isElectionEnded() ? 'var(--slate-400)' : '#f59e0b' }}>{isElectionEnded() ? 'CLOSED' : 'VOTING IN PROGRESS'}</p></div>
            {lastUpdated && <div style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--slate-500)' }}>Updated: {lastUpdated.toLocaleTimeString()}</div>}
          </div>

          {results.map((r, idx) => {
            const totalPositionVotes = r.candidates.reduce((s, c) => s + c.votes, 0);
            const winnerLabel = getWinnerLabel(r.candidates);

            return (
              <motion.div key={r.positionId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>📋 {r.position}</h3>
                  {winnerLabel ? (
                    <span className={`badge ${winnerLabel.includes('TIE') ? 'badge-yellow' : 'badge-green'}`}>{winnerLabel}</span>
                  ) : (
                    !isElectionEnded() && <span className="badge badge-yellow">⏳ Voting in progress</span>
                  )}
                </div>

                {/* Live vote count figures per candidate */}
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`, gap: '0.75rem', marginBottom: '1rem' }}>
                  {r.candidates.map((c, ci) => {
                    const pct = totalPositionVotes > 0 ? Math.round((c.votes / totalPositionVotes) * 100) : 0;
                    return (
                      <div key={c.id} style={{ padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center', background: 'var(--slate-800)', borderLeft: `3px solid ${CANDIDATE_COLORS[ci % CANDIDATE_COLORS.length]}` }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: CANDIDATE_COLORS[ci % CANDIDATE_COLORS.length] }}>{c.votes}</div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>{pct}% of votes</div>
                      </div>
                    );
                  })}
                </div>

                {/* Smaller charts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '1rem' }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={r.candidates}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={{ stroke: '#334155' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                      <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                        {r.candidates.map((_, i) => <Cell key={i} fill={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={r.candidates} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="votes" nameKey="name" paddingAngle={3}>
                        {r.candidates.map((_, i) => <Cell key={i} fill={CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                      <Legend wrapperStyle={{ fontSize: '0.6875rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
