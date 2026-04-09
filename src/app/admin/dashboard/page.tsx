'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDate } from '@/lib/formatDate';

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
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
