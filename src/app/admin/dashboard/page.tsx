'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate } from '@/lib/formatDate';

const CANDIDATE_COLORS = [
  '#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#a855f7',
];

interface DashboardStats {
  totalStudents: number;
  activeElections: number;
  totalVotes: number;
  participationRate: number;
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    performed_by: string;
    created_at: string;
  }>;
  electionStats: Array<{ name: string; votes: number; status: string }>;
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [elections, setElections] = useState<any[]>([]);
  const [liveResults, setLiveResults] = useState<Record<string, { results: any[]; totalVoters: number; election: any }>>({});

  useEffect(() => {
    fetchStats();
    
    // Poll for realtime differentiation updates every 30 seconds to spare heavy mobile CPUs
    const iv = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(iv);
  }, []);

  const fetchStats = async (silent = false) => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }

      // Fetch precise active elections to differentiate live feeds explicitly
      const elRes = await fetch('/api/elections');
      if (elRes.ok) {
        const elData = await elRes.json();
        setElections(elData);
        
        const activeEls = elData.filter((e: any) => e.status === 'ACTIVE' || e.status === 'CLOSED');
        for (const el of activeEls) {
          try {
            const lr = await fetch(`/api/results/${el.id}`);
            const lrData = await lr.json();
            if (lrData && !lrData.error) {
              setLiveResults(prev => ({ ...prev, [el.id]: lrData }));
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: '🎓', color: '#10b981' },
    { label: 'Active Elections', value: stats?.activeElections || 0, icon: '🗳️', color: '#3b82f6' },
    { label: 'Total Votes', value: stats?.totalVotes || 0, icon: '✅', color: '#8b5cf6' },
    { label: 'Participation', value: `${stats?.participationRate || 0}%`, icon: '📊', color: '#f59e0b' },
  ];

  const pieData = stats?.electionStats?.filter(e => e.votes > 0) || [];
  
  const visibleActivity = showAllActivity 
    ? stats?.recentActivity || [] 
    : (stats?.recentActivity || []).slice(0, 10);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>Welcome back! Here&apos;s an overview of your voting system.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', fontWeight: 500 }}>{card.label}</span>
              <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: card.color }}>{card.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-200)' }}>Votes Per Election</h3>
          {stats?.electionStats && stats.electionStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.electionStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }}
                />
                <Bar dataKey="votes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)' }}>
              No election data yet
            </div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-200)' }}>Vote Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="votes" nameKey="name">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-500)' }}>
              No vote data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Realtime Differentiated Results */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--slate-200)' }}>🛰️ Live Updates by Election</h2>
        {elections.filter(el => el.status === 'ACTIVE' || el.status === 'CLOSED').length === 0 ? (
          <p style={{ color: 'var(--slate-500)', fontStyle: 'italic' }}>No active live tracking available at the moment.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '1rem' }}>
            {elections.filter(el => el.status === 'ACTIVE' || el.status === 'CLOSED').map(el => {
              const live = liveResults[el.id];
              if (!live || live.results.length === 0) return null;

              const ended = el.status === 'CLOSED';

              return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={el.id} className="card" style={{ border: '1px solid var(--slate-700)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--slate-800)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ended ? 'var(--slate-500)' : 'var(--green-500)' }} className={ended ? '' : 'pulse-green'} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-200)' }}>{el.title}</h3>
                    </div>
                    <span className={`badge ${ended ? 'badge-gray' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                      {ended ? 'CLOSED' : 'LIVE'} ({live.totalVoters} Voters)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {live.results.map((pos: any) => {
                      const totalVotes = pos.candidates.reduce((s: any, c: any) => s + c.votes, 0);
                      const maxVotes = pos.candidates.length > 0 ? pos.candidates[0].votes : 0;
                      const isTie = pos.candidates.filter((c: any) => c.votes === maxVotes && maxVotes > 0).length > 1;

                      return (
                        <div key={pos.positionId}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--slate-300)' }}>{pos.position}</span>
                            {ended && maxVotes > 0 && (
                              <span className={`badge ${isTie ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: '0.65rem' }}>
                                {isTie ? '🤝 TIE' : `🏆 ${pos.candidates[0].name}`}
                              </span>
                            )}
                          </div>

                          {pos.candidates.map((c: any, ci: number) => {
                            const pct = totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0;
                            return (
                              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                                <div style={{ flex: 1, height: '8px', background: 'var(--slate-800)', borderRadius: '4px', overflow: 'hidden' }}>
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
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: CANDIDATE_COLORS[ci % CANDIDATE_COLORS.length], minWidth: '40px', textAlign: 'right' }}>{c.votes} </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--slate-200)' }}>Recent Activity</h3>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Details</th>
                  <th>By</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {visibleActivity.map((log) => (
                  <tr key={log.id}>
                    <td><span className="badge badge-green">{log.action}</span></td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                    <td>{log.performed_by}</td>
                    <td style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--slate-500)', textAlign: 'center', padding: '2rem' }}>No activity yet</p>
        )}
        
        {stats?.recentActivity && stats.recentActivity.length > 10 && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => setShowAllActivity(!showAllActivity)}
            >
              {showAllActivity 
                ? 'Show Less ⬆️' 
                : `View ${stats.recentActivity.length - 10} More Activities ⬇️`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
