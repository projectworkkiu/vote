'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to change password');
        return;
      }

      toast.success('Password changed successfully!');
      router.push('/admin/dashboard');
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '1rem' }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '420px', zIndex: 10 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b, #eab308)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Change Password</h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>You must change your password before continuing</p>
        </div>

        <div className="glass" style={{ borderRadius: '1rem', padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Current Password</label>
              <input type="password" className="input" placeholder="Enter current password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">New Password</label>
              <input type="password" className="input" placeholder="Enter new password (min 6 chars)" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" placeholder="Confirm new password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
            <motion.button type="submit" className="btn btn-primary btn-lg" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ width: '100%' }}>
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Update Password'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
