'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newUsername: '', newPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword) {
      toast.error('Current password is required to make changes');
      return;
    }

    if (!form.newUsername && !form.newPassword) {
      toast.error('Please enter a new username or password to update');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Credentials updated successfully!');
        setForm({ currentPassword: '', newUsername: '', newPassword: '' });
      } else {
        toast.error(data.error || 'Failed to update credentials');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admin Settings</h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>Update your admin credentials securely.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Update Credentials</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--slate-800)' }}>
            <label className="label">Current Password *</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Verify your current password" 
              value={form.currentPassword} 
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} 
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.5rem' }}>Required to authorize any changes.</p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="label">New Username (Optional)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Leave blank to keep current" 
              value={form.newUsername} 
              onChange={(e) => setForm({ ...form, newUsername: e.target.value })} 
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">New Password (Optional)</label>
            <input 
              type="password" 
              className="input" 
              placeholder="Leave blank to keep current" 
              value={form.newPassword} 
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
