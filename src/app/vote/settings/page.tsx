'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function StudentSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/student/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Password updated successfully! Redirecting...');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => router.push('/vote'), 2000);
      } else {
        toast.error(data.error || 'Failed to update password');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>⚙️ Student Settings</h1>
        <p style={{ color: 'var(--slate-400)' }}>Manage your account security and preferences.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Change Password</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">Current Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Enter your current password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">New Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="At least 6 characters"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="label">Confirm New Password</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Confirm your new password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => router.push('/vote')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ minWidth: '120px' }}
            >
              {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
