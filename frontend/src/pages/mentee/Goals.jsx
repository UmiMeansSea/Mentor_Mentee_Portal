import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function MenteeGoals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => { api.get('/goals/my').then(r => setGoals(r.data)); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await api.post('/goals', form);
      setGoals([res.data, ...goals]);
      setShowModal(false); setForm({ title: '', description: '' });
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/goals/${id}`);
    setGoals(goals.filter(g => g.id !== id));
  };

  const statusColor = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
  const statusIcon = { PENDING: '⏳', APPROVED: '✅', REJECTED: '❌' };

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Goals</span></div>
        <h1>My Goals</h1>
        <p>Submit your learning goals for mentor approval</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Goals</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Submit Goal</button>
        </div>

        {goals.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🎯</div><h3>No goals yet</h3><p>Submit your first learning goal</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {goals.map(g => (
              <div key={g.id} style={{ border: '1px solid var(--sap-border)', borderRadius: 'var(--sap-radius-lg)', padding: '1rem', background: 'var(--sap-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{statusIcon[g.status]} {g.title}</div>
                    {g.description && <div style={{ fontSize: 13, color: 'var(--sap-text-2)', marginTop: 4 }}>{g.description}</div>}
                    {g.mentorNote && (
                      <div style={{ fontSize: 12, color: 'var(--sap-text-3)', marginTop: 6, fontStyle: 'italic' }}>
                        Mentor note: {g.mentorNote}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--sap-text-3)', marginTop: 6 }}>
                      Submitted {new Date(g.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span className={`badge ${statusColor[g.status]}`}>{g.status}</span>
                    {g.status === 'PENDING' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(g.id)}>Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Submit a Goal</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Goal Title</label>
                <input className="form-input" placeholder="e.g. Learn React in 30 days"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-input" placeholder="Describe your goal in detail…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
