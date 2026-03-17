import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function MentorTasks() {
  const [tasks, setTasks] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', menteeId: '', dueDate: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/tasks/assigned').then(r => setTasks(r.data));
    api.get('/mentorships/my-mentees').then(r => setMentees(r.data));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await api.post('/tasks', form);
      setTasks([res.data, ...tasks]);
      setShowModal(false); setForm({ title: '', description: '', menteeId: '', dueDate: '' });
    } catch (err) { setError(err.response?.data?.error || 'Failed to create task'); }
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks(tasks.filter(t => t.id !== id));
  };

  const statusColor = { ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in_progress', COMPLETED: 'badge-completed' };

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Tasks</span></div>
        <h1>Task Management</h1>
        <p>Assign and track tasks for your mentees</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Assigned Tasks</span>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Assign Task</button>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No tasks assigned yet</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Task</th><th>Assigned To</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      {t.description && <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{t.description}</div>}
                    </td>
                    <td>{t.assignedTo?.name}</td>
                    <td style={{ fontSize: 12 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${statusColor[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Assign New Task</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input className="form-input" placeholder="e.g. Complete React tutorial"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-input" placeholder="Details about the task…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-input" value={form.menteeId} onChange={e => setForm({ ...form, menteeId: e.target.value })} required>
                  <option value="">Select a mentee…</option>
                  {mentees.map(m => <option key={m.mentee.id} value={m.mentee.id}>{m.mentee.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date (optional)</label>
                <input className="form-input" type="datetime-local"
                  value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
