'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  photo: string | null;
  bio: string | null;
  position_id: string;
  position?: { id: string; name: string; election?: { id: string; title: string; status: string } };
}

interface Position {
  id: string;
  name: string;
  election_id: string;
}

interface Election {
  id: string;
  title: string;
  positions?: Position[];
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  
  const [form, setForm] = useState({ name: '', bio: '', photo: '', positionId: '' });
  const [filterElection, setFilterElection] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [candRes, elRes] = await Promise.all([
        fetch('/api/candidates'),
        fetch('/api/elections'),
      ]);
      if (candRes.ok) setCandidates(await candRes.json());
      if (elRes.ok) setElections(await elRes.json());
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingCandidate(null);
    setForm({ name: '', bio: '', photo: '', positionId: '' });
    setShowModal(true);
  };

  const openEdit = (c: Candidate) => {
    setEditingCandidate(c);
    setForm({ name: c.name, bio: c.bio || '', photo: c.photo || '', positionId: c.position_id });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.positionId) {
      toast.error('Name and position are required');
      return;
    }

    try {
      const url = editingCandidate ? `/api/candidates/${editingCandidate.id}` : '/api/candidates';
      const method = editingCandidate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success(editingCandidate ? 'Candidate updated!' : 'Candidate added!');
        setShowModal(false);
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed');
      }
    } catch { toast.error('Network error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this candidate?')) return;
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Deleted'); fetchData(); }
    } catch { toast.error('Failed'); }
  };

  const filteredCandidates = filterElection
    ? candidates.filter(c => c.position?.election?.id === filterElection)
    : candidates;

  const allPositions = elections.flatMap(el => (el.positions || []).map(p => ({ ...p, electionTitle: el.title })));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Candidates</h1>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>Manage election candidates</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="input" style={{ width: 'auto', minWidth: '180px' }} value={filterElection} onChange={(e) => setFilterElection(e.target.value)}>
            <option value="">All Elections</option>
            {elections.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary" onClick={openCreate}>
            + Add Candidate
          </motion.button>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</p>
          <p style={{ color: 'var(--slate-500)' }}>No candidates yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Position</th>
                <th>Election</th>
                <th>Bio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: c.photo ? `url(${c.photo}) center/cover` : 'linear-gradient(135deg, #059669, #10b981)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: '0.875rem',
                    }}>
                      {!c.photo && c.name.charAt(0).toUpperCase()}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><span className="badge badge-green">{c.position?.name || 'N/A'}</span></td>
                  <td style={{ color: 'var(--slate-400)', fontSize: '0.8125rem' }}>{c.position?.election?.title || 'N/A'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--slate-400)', fontSize: '0.8125rem' }}>{c.bio || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
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
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                {editingCandidate ? 'Edit Candidate' : 'Add Candidate'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Name *</label>
                  <input className="input" placeholder="Candidate name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Position *</label>
                  <select className="input" value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })}>
                    <option value="">Select position</option>
                    {allPositions.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.electionTitle}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Candidate Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>Link:</span>
                    <input className="input" style={{ padding: '0.3rem 0.5rem', height: 'auto', fontSize: '0.8125rem' }} placeholder="https://..." value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
                  </div>
                  {form.photo && (
                     <div style={{ marginTop: '0.5rem' }}>
                       <img src={form.photo} alt="Preview" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--green-500)' }} />
                     </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="label">Bio / Manifesto</label>
                  <textarea className="input" rows={3} placeholder="Candidate bio or manifesto..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingCandidate ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
