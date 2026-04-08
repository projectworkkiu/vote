'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#065f46'];

interface Result {
  position: string;
  positionId: string;
  candidates: Array<{ id: string; name: string; photo: string | null; votes: number }>;
}

export default function ResultsPage() {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/elections')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setElections(data);
        } else {
          console.error('Expected array from /api/elections, got:', data);
          setElections([]);
        }
      })
      .catch((err) => {
        console.error('Fetch elections error:', err);
        setElections([]);
      });
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    setLoading(true);
    fetch(`/api/results/${selectedElection}`)
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setResults(data.results || []);
          setTotalVoters(data.totalVoters || 0);
        } else {
          console.error('Results error:', data?.error);
          setResults([]);
          setTotalVoters(0);
        }
      })
      .catch((err) => {
        console.error('Fetch results error:', err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [selectedElection]);

  const exportCSV = () => {
    let csv = 'Position,Candidate,Votes\n';
    results.forEach(r => {
      r.candidates.forEach(c => { csv += `${r.position},${c.name},${c.votes}\n`; });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'election-results.csv'; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Results & Analytics</h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>View election results and analytics</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select className="input" style={{ width: 'auto', minWidth: '200px' }} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">Select Election</option>
            {Array.isArray(elections) && elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
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
          <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div><span style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>Total Voters</span><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-400)' }}>{totalVoters}</p></div>
            <div><span style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>Positions</span><p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--info)' }}>{results.length}</p></div>
          </div>

          {results.map((r, idx) => (
            <motion.div key={r.positionId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
                🏆 {r.position}
                {r.candidates.length > 0 && (
                  <span className="badge badge-green" style={{ marginLeft: '0.75rem' }}>
                    Winner: {r.candidates[0].name}
                  </span>
                )}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', minHeight: '200px' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={r.candidates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                      {r.candidates.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={r.candidates} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="votes" nameKey="name" paddingAngle={3}>
                      {r.candidates.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
