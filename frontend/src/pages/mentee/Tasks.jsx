import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function MenteeTasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => { api.get('/tasks/my').then(r => setTasks(r.data)); }, []);

  const handleStatus = async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status });
    setTasks(tasks.map(t => t.id === id ? res.data : t));
  };

  const statusColor = { ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in_progress', COMPLETED: 'badge-completed' };

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Tasks</span></div>
        <h1>My Tasks</h1>
        <p>Tasks assigned by your mentors</p>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">All Tasks</span>
          <span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{tasks.filter(t => t.status !== 'COMPLETED').length} open</span>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No tasks assigned</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Task</th><th>Assigned By</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {tasks.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      {t.description && <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{t.description}</div>}
                    </td>
                    <td style={{ fontSize: 13 }}>{t.assignedBy?.name}</td>
                    <td style={{ fontSize: 12 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${statusColor[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {t.status === 'ASSIGNED' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(t.id, 'IN_PROGRESS')}>Start</button>
                        )}
                        {t.status === 'IN_PROGRESS' && (
                          <button className="btn btn-success btn-sm" onClick={() => handleStatus(t.id, 'COMPLETED')}>Complete</button>
                        )}
                        {t.status === 'COMPLETED' && <span style={{ fontSize: 12, color: 'var(--sap-success)' }}>✓ Done</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
