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
  student_id?: string | null;
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
  status: string;
  start_date?: string;
  end_date?: string;
  positions?: Position[];
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  
  const [form, setForm] = useState({ name: '', bio: '', photo: '', positionId: '', studentId: '', electionId: '' });
  const [filterElection, setFilterElection] = useState('');
  
  const [studentSuggestions, setStudentSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleStudentSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setStudentSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`/api/students?search=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setStudentSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    setForm({ name: '', bio: '', photo: '', positionId: '', studentId: '', electionId: filterElection || '' });
    setStudentSuggestions([]);
    setShowSuggestions(false);
    setShowModal(true);
  };

  const openEdit = (c: Candidate) => {
    setEditingCandidate(c);
    setForm({ name: c.name, bio: c.bio || '', photo: c.photo || '', positionId: c.position_id, studentId: c.student_id || '', electionId: c.position?.election?.id || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.positionId) {
      toast.error('Name and position are required.');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setForm({ ...form, photo: dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</p>
          <p style={{ color: 'var(--slate-500)' }}>No active elections found</p>
        </div>
      ) : (
        <div>
          {elections
            .filter(el => filterElection ? el.id === filterElection : true)
            .map(el => {
              const elCandidates = filteredCandidates.filter(c => c.position?.election?.id === el.id);

              return (
                <div key={el.id} style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--slate-800)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: el.status === 'ACTIVE' ? 'var(--green-500)' : 'var(--slate-500)' }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-200)' }}>
                      {el.title}
                    </h2>
                    <span className={`badge ${el.status === 'ACTIVE' ? 'badge-green' : el.status === 'CLOSED' ? 'badge-gray' : 'badge-yellow'}`} style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
                      {el.status === 'ACTIVE' ? 'ONGOING' : el.status}
                    </span>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Photo</th>
                          <th>Name</th>
                          <th>Position</th>
                          <th>Bio</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {elCandidates.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)' }}>
                              No candidates added to this election yet.
                            </td>
                          </tr>
                        ) : (
                          elCandidates.map((c) => (
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
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--slate-400)', fontSize: '0.8125rem' }}>{c.bio || '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>Edit</button>
                                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
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
                <div style={{ marginBottom: '1rem', position: 'relative' }}>
                  <label className="label">Name *</label>
                  <input 
                    className="input" 
                    placeholder="Candidate name" 
                    value={form.name} 
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value, studentId: '' });
                      handleStudentSearch(e.target.value);
                      setShowSuggestions(true);
                    }} 
                    onFocus={() => setShowSuggestions(true)}
                  />
                  {showSuggestions && studentSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, 
                      background: 'var(--slate-800)', border: '1px solid var(--slate-700)', 
                      borderRadius: '0.5rem', marginTop: '0.25rem', zIndex: 10,
                      maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                      {studentSuggestions.map((st) => (
                        <div 
                          key={st.id}
                          style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--slate-700)' }}
                          onClick={() => {
                            setForm({ ...form, name: st.name, studentId: st.student_id });
                            setShowSuggestions(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--slate-700)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{st.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{st.student_id} - {st.class}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Election *</label>
                  <select className="input" disabled={!!editingCandidate} value={form.electionId} onChange={(e) => setForm({ ...form, electionId: e.target.value, positionId: '' })}>
                    <option value="">Select an election first</option>
                    {elections.map(el => (
                      <option key={el.id} value={el.id} disabled={!editingCandidate && el.status !== 'DRAFT'}>
                        {el.title} {el.status === 'ACTIVE' ? '(Ongoing - Locked)' : el.status === 'CLOSED' ? '(Closed)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Position *</label>
                  <select className="input" disabled={!form.electionId} value={form.positionId} onChange={(e) => setForm({ ...form, positionId: e.target.value })}>
                    <option value="">Select a position from chosen election</option>
                    {allPositions.filter(p => p.election_id === form.electionId).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label className="label">Candidate Photo</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', minWidth: '40px' }}>Upload:</span>
                      <input type="file" accept="image/*" className="input" style={{ padding: '0.3rem 0.5rem', height: 'auto', fontSize: '0.8125rem', flex: 1 }} onChange={handleFileUpload} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', minWidth: '40px' }}>Or Link:</span>
                      <input className="input" style={{ padding: '0.3rem 0.5rem', height: 'auto', fontSize: '0.8125rem', flex: 1 }} placeholder="https://..." value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} />
                    </div>
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
