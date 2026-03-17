import { useEffect, useState } from 'react';
import api from '../../utils/api';

export function AdminMentorships() {
  const [data, setData] = useState([]);
  useEffect(() => { api.get('/admin/mentorships').then(r => setData(r.data)); }, []);
  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Admin</span> / <span>Assignments</span></div>
        <h1>Mentor-Mentee Assignments</h1>
        <p>All active mentorship relationships on the platform</p>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Assignments</span><span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{data.length} total</span></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Mentor</th><th>Mentee</th><th>Date Joined</th></tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.mentor.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{d.mentor.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{d.mentee.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{d.mentee.email}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminGoals() {
  const [data, setData] = useState([]);
  useEffect(() => { api.get('/admin/goals').then(r => setData(r.data)); }, []);
  const statusColor = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Admin</span> / <span>Goals</span></div>
        <h1>All Goals</h1>
        <p>Goals submitted by mentees across the platform</p>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Goals</span><span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{data.length} total</span></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Goal</th><th>Mentee</th><th>Status</th><th>Mentor Note</th><th>Date</th></tr></thead>
            <tbody>
              {data.map(g => (
                <tr key={g.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{g.title}</div>
                    {g.description && <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{g.description}</div>}
                  </td>
                  <td>{g.mentee?.name}</td>
                  <td><span className={`badge ${statusColor[g.status]}`}>{g.status}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{g.mentorNote || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{new Date(g.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminTasks() {
  const [data, setData] = useState([]);
  useEffect(() => { api.get('/admin/tasks').then(r => setData(r.data)); }, []);
  const statusColor = { ASSIGNED: 'badge-assigned', IN_PROGRESS: 'badge-in_progress', COMPLETED: 'badge-completed' };
  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Admin</span> / <span>Tasks</span></div>
        <h1>All Tasks</h1>
        <p>Tasks assigned across all mentor-mentee pairs</p>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Tasks</span><span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{data.length} total</span></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Task</th><th>Assigned By</th><th>Assigned To</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {data.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.title}</td>
                  <td>{t.assignedBy?.name}</td>
                  <td>{t.assignedTo?.name}</td>
                  <td style={{ fontSize: 12 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge ${statusColor[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminSessions() {
  const [data, setData] = useState([]);
  useEffect(() => { api.get('/admin/sessions').then(r => setData(r.data)); }, []);
  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Admin</span> / <span>Sessions</span></div>
        <h1>All Sessions</h1>
        <p>Scheduled sessions across the platform</p>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Sessions</span><span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{data.length} total</span></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Title</th><th>Mentor</th><th>Mentee</th><th>Start</th><th>End</th></tr></thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.title}</td>
                  <td>{s.mentor?.name}</td>
                  <td>{s.mentee?.name}</td>
                  <td style={{ fontSize: 12 }}>{new Date(s.startTime).toLocaleString()}</td>
                  <td style={{ fontSize: 12 }}>{new Date(s.endTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
