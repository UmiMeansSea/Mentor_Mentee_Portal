import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/mentorships/my-mentees'),
      api.get('/tasks/assigned'),
      api.get('/sessions'),
    ]).then(([m, t, s]) => {
      setMentees(m.data); setTasks(t.data); setSessions(s.data);
    }).finally(() => setLoading(false));
  }, []);

  const upcoming = sessions.filter(s => new Date(s.startTime) > new Date()).slice(0, 3);
  const pendingTasks = tasks.filter(t => t.status === 'ASSIGNED').length;

  if (loading) return <div style={{ padding: '2rem', color: 'var(--sap-text-3)' }}>Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span></div>
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's an overview of your mentoring activity</p>
      </div>

      {/* Invite Code */}
      {user?.inviteCode && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Your Invite Code</span>
            <span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>Share this with your mentees</span>
          </div>
          <div className="invite-code-box">
            <div style={{ fontSize: 12, color: 'var(--sap-text-2)', marginBottom: 6 }}>Mentees join using this code</div>
            <div className="invite-code">{user.inviteCode}</div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
              onClick={() => navigator.clipboard.writeText(user.inviteCode)}>
              📋 Copy Code
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Total Mentees</div>
          <div className="value">{mentees.length}</div>
          <div className="sublabel">Active relationships</div>
        </div>
        <div className="stat-card">
          <div className="label">Tasks Assigned</div>
          <div className="value">{tasks.length}</div>
          <div className="sublabel">{pendingTasks} pending</div>
        </div>
        <div className="stat-card">
          <div className="label">Sessions</div>
          <div className="value">{sessions.length}</div>
          <div className="sublabel">{upcoming.length} upcoming</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Mentees */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Mentees</span>
            <Link to="/mentor/mentees" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {mentees.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No mentees yet</h3>
              <p>Share your invite code to get started</p>
            </div>
          ) : (
            mentees.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--sap-border)' }}>
                <div className="chat-contact-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {m.mentee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.mentee.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{m.mentee.email}</div>
                </div>
                <Link to={`/mentor/chat?userId=${m.mentee.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Chat</Link>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Sessions</span>
            <Link to="/mentor/sessions" className="btn btn-ghost btn-sm">Calendar →</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No upcoming sessions</h3>
              <p>Schedule a session with a mentee</p>
            </div>
          ) : (
            upcoming.map(s => (
              <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--sap-border)' }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--sap-text-3)', marginTop: 2 }}>
                  with {s.mentee.name} · {new Date(s.startTime).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
