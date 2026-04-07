'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/formatDate';

interface Student {
  id: string; student_id: string; name: string; class: string; is_active: boolean; created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [form, setForm] = useState({ studentId: '', name: '', className: '', password: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async (q = '') => {
    try {
      const res = await fetch(`/api/students${q ? `?search=${q}` : ''}`);
      if (res.ok) setStudents(await res.json());
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.name || !form.className || !form.password) { toast.error('All fields required'); return; }
    try {
      const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { toast.success('Student added!'); setShowModal(false); fetchStudents(); }
      else { const d = await res.json(); toast.error(d.error); }
    } catch { toast.error('Network error'); }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !active }) });
    toast.success(active ? 'Deactivated' : 'Activated'); fetchStudents();
  };

  const resetPw = async (id: string, sid: string) => {
    const pw = prompt(`New password for ${sid}:`);
    if (!pw) return;
    await fetch(`/api/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    toast.success('Password reset!');
  };

  const del = async (id: string) => {
    if (!confirm('Delete student?')) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    toast.success('Deleted'); fetchStudents();
  };

  const bulkUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Select CSV'); return; }
    setBulkLoading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await fetch('/api/students/bulk', { method: 'POST', body: fd });
      const d = await res.json();
      if (res.ok) { toast.success(`${d.added} added, ${d.skipped} skipped`); setShowBulk(false); fetchStudents(); }
      else toast.error(d.error);
    } catch { toast.error('Failed'); } finally { setBulkLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Students</h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>{students.length} registered</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="input" style={{ width: '200px' }} placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); fetchStudents(e.target.value); }} />
          <button className="btn btn-secondary" onClick={() => setShowBulk(true)}>📄 CSV Upload</button>
          <motion.button whileHover={{ scale: 1.02 }} className="btn btn-primary" onClick={() => { setForm({ studentId: '', name: '', className: '', password: '' }); setShowModal(true); }}>+ Add Student</motion.button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</p>
          <p style={{ color: 'var(--slate-500)' }}>No students yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Student ID</th><th>Name</th><th>Course</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{s.student_id}</td>
                  <td>{s.name}</td><td>{s.class}</td>
                  <td><span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => toggleActive(s.id, s.is_active)}>{s.is_active ? 'Disable' : 'Enable'}</button>
                      <button className="btn btn-sm btn-secondary" onClick={() => resetPw(s.id, s.student_id)}>Reset PW</button>
                      <button className="btn btn-sm btn-danger" onClick={() => del(s.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Add Student</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}><label className="label">Student ID *</label><input className="input" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} /></div>
                <div style={{ marginBottom: '1rem' }}><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div style={{ marginBottom: '1rem' }}><label className="label">Course *</label><input className="input" placeholder="e.g. Computer Science" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></div>
                <div style={{ marginBottom: '1.5rem' }}><label className="label">Password *</label><input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        {showBulk && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulk(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>CSV Upload</h2>
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--slate-400)' }}>
                <strong style={{ color: 'var(--green-400)' }}>Format:</strong> studentId, name, course, password
              </div>
              <input type="file" ref={fileRef} accept=".csv" className="input" style={{ marginBottom: '1.5rem' }} />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={bulkUpload} disabled={bulkLoading}>{bulkLoading ? 'Uploading...' : 'Upload'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
