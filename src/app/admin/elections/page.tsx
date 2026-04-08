'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/formatDate';

interface Election {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  positions?: Array<{ id: string; name: string; candidates?: any[] }>;
}

export default function ElectionsPage() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingElection, setEditingElection] = useState<Election | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '', positions: [''],
  });

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    try {
      const res = await fetch('/api/elections');
      if (res.ok) setElections(await res.json());
    } catch { toast.error('Failed to load elections'); }
    finally { setLoading(false); }
  };

  const toLocalISOString = (utcString: string) => {
    if (!utcString) return '';
    const date = new Date(utcString);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
  };

  const openCreate = () => {
    setEditingElection(null);
    setForm({ title: '', description: '', startDate: '', endDate: '', positions: [''] });
    setShowModal(true);
  };

  const openEdit = (el: Election) => {
    setEditingElection(el);
    setForm({
      title: el.title,
      description: el.description,
      startDate: toLocalISOString(el.start_date),
      endDate: toLocalISOString(el.end_date),
      positions: el.positions?.map(p => p.name) || [''],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Please fill in required fields');
      return;
    }

    const positions = form.positions.filter(p => p.trim());
    const body = {
      title: form.title,
      description: form.description,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      positions,
    };

    try {
      const url = editingElection ? `/api/elections/${editingElection.id}` : '/api/elections';
      const method = editingElection ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (res.ok) {
        toast.success(editingElection ? 'Election updated!' : 'Election created!');
        setShowModal(false);
        fetchElections();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Network error'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/elections/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success(`Election ${status.toLowerCase()}`); fetchElections(); }
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this election? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/elections/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Election deleted'); fetchElections(); }
    } catch { toast.error('Failed to delete'); }
  };

  const addPosition = () => setForm({ ...form, positions: [...form.positions, ''] });
  const removePosition = (i: number) => setForm({ ...form, positions: form.positions.filter((_, idx) => idx !== i) });
  const updatePosition = (i: number, val: string) => {
    const updated = [...form.positions];
    updated[i] = val;
    setForm({ ...form, positions: updated });
  };

  const statusBadge = (status: string) => {
    const cls = status === 'ACTIVE' ? 'badge-green' : status === 'DRAFT' ? 'badge-yellow' : 'badge-gray';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Elections</h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>Manage all school elections</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary" onClick={openCreate}>
          + Create Election
        </motion.button>
      </div>

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</p>
          <p style={{ color: 'var(--slate-400)' }}>No elections yet. Create your first election!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Positions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {elections.map((el) => (
                <tr key={el.id}>
                  <td style={{ fontWeight: 600 }}>{el.title}</td>
                  <td>{statusBadge(el.status)}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--slate-400)' }}>{formatDate(el.start_date)}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--slate-400)' }}>{formatDate(el.end_date)}</td>
                  <td><span className="badge badge-blue">{el.positions?.length || 0}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {el.status === 'DRAFT' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(el.id, 'ACTIVE')}>Activate</button>
                      )}
                      {el.status === 'ACTIVE' && (
                        <button className="btn btn-sm btn-secondary" onClick={() => handleStatusChange(el.id, 'CLOSED')}>Close</button>
                      )}
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(el)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(el.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '36rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                {editingElection ? 'Edit Election' : 'Create Election'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Title *</label>
                  <input className="input" placeholder="e.g. Student Council Election 2025" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Description</label>
                  <textarea className="input" placeholder="Election description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="label">Start Date *</label>
                    <input type="datetime-local" className="input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">End Date *</label>
                    <input type="datetime-local" className="input" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Positions</label>
                  {form.positions.map((pos, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input className="input" placeholder={`e.g. Head Prefect, Secretary...`} value={pos} onChange={(e) => updatePosition(i, e.target.value)} />
                      {form.positions.length > 1 && (
                        <button type="button" className="btn btn-sm btn-danger" onClick={() => removePosition(i)}>✕</button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addPosition}>+ Add Position</button>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingElection ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
