import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/mentorships/my-mentors'),
      api.get('/goals/my'),
      api.get('/tasks/my'),
    ]).then(([m, g, t]) => {
      setMentors(m.data); setGoals(g.data); setTasks(t.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault(); setJoinError(''); setJoinSuccess('');
    try {
      const res = await api.post('/mentorships/join', { inviteCode: joinCode.toUpperCase().trim() });
      setMentors([...mentors, res.data]);
      setJoinSuccess(`Successfully joined ${res.data.mentor.name}'s group!`);
      setJoinCode('');
    } catch (err) { setJoinError(err.response?.data?.error || 'Invalid code'); }
  };

  const pendingGoals = goals.filter(g => g.status === 'PENDING').length;
  const openTasks = tasks.filter(t => t.status !== 'COMPLETED').length;

  if (loading) return <div style={{ padding: '2rem', color: 'var(--sap-text-3)' }}>Loading…</div>;

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span></div>
        <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Track your goals, tasks, and sessions</p>
      </div>

      {/* Join Mentor */}
      {mentors.length < 2 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Join a Mentor</span>
            <span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>You can have up to 2 mentors</span>
          </div>
          {joinError && <div className="alert alert-error">⚠ {joinError}</div>}
          {joinSuccess && <div className="alert alert-success">✓ {joinSuccess}</div>}
          <form onSubmit={handleJoin} style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" placeholder="Enter invite code (e.g. SARAH2024)"
              value={joinCode} onChange={e => setJoinCode(e.target.value)} style={{ flex: 1, textTransform: 'uppercase', letterSpacing: 2 }} required />
            <button type="submit" className="btn btn-primary">Join</button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">My Mentors</div>
          <div className="value">{mentors.length}<span style={{ fontSize: 14, color: 'var(--sap-text-3)' }}>/2</span></div>
          <div className="sublabel">Active mentors</div>
        </div>
        <div className="stat-card">
          <div className="label">Goals</div>
          <div className="value">{goals.length}</div>
          <div className="sublabel">{pendingGoals} awaiting approval</div>
        </div>
        <div className="stat-card">
          <div className="label">Tasks</div>
          <div className="value">{tasks.length}</div>
          <div className="sublabel">{openTasks} open</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Mentors list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">My Mentors</span>
            <Link to="/mentee/mentors" className="btn btn-ghost btn-sm">Manage →</Link>
          </div>
          {mentors.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🎓</div><h3>No mentors yet</h3><p>Enter an invite code above</p></div>
          ) : mentors.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--sap-border)' }}>
              <div className="chat-contact-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {m.mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{m.mentor.name}</div>
                <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{m.mentor.email}</div>
              </div>
              <Link to={`/mentee/chat?userId=${m.mentor.id}`} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>Chat</Link>
            </div>
          ))}
        </div>

        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Tasks</span>
            <Link to="/mentee/tasks" className="btn btn-ghost btn-sm">View all →</Link>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No tasks yet</h3></div>
          ) : tasks.slice(0, 4).map(t => (
            <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--sap-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>from {t.assignedBy?.name}</div>
              </div>
              <span className={`badge badge-${t.status.toLowerCase()}`}>{t.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
