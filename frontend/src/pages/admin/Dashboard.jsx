import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem', color: 'var(--sap-text-3)' }}>Loading…</div>;

  const getGoalCount = (status) => stats?.goalStats?.find(g => g.status === status)?._count || 0;
  const getTaskCount = (status) => stats?.taskStats?.find(t => t.status === status)?._count || 0;

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Administration</span></div>
        <h1>Platform Overview</h1>
        <p>MentorPath Administration Portal</p>
      </div>

      {/* Main stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {[
          { label: 'Total Mentors', value: stats.totalMentors, sub: 'Registered', color: '#3949AB' },
          { label: 'Total Mentees', value: stats.totalMentees, sub: 'Registered', color: '#00838F' },
          { label: 'Assignments', value: stats.totalMentorships, sub: 'Active pairs', color: 'var(--sap-brand)' },
          { label: 'Goals', value: stats.totalGoals, sub: `${getGoalCount('PENDING')} pending`, color: 'var(--sap-warning)' },
          { label: 'Tasks', value: stats.totalTasks, sub: `${getTaskCount('COMPLETED')} done`, color: 'var(--sap-success)' },
          { label: 'Sessions', value: stats.totalSessions, sub: 'Scheduled', color: 'var(--sap-brand)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="label">{s.label}</div>
            <div className="value" style={{ color: s.color }}>{s.value}</div>
            <div className="sublabel">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Goal / Task breakdown */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Goal Status Breakdown</span><Link to="/admin/goals" className="btn btn-ghost btn-sm">View all →</Link></div>
          {[
            { status: 'PENDING', label: 'Pending Review', cls: 'badge-pending' },
            { status: 'APPROVED', label: 'Approved', cls: 'badge-approved' },
            { status: 'REJECTED', label: 'Rejected', cls: 'badge-rejected' },
          ].map(row => (
            <div key={row.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--sap-border)' }}>
              <span className={`badge ${row.cls}`}>{row.label}</span>
              <strong style={{ fontSize: 18 }}>{getGoalCount(row.status)}</strong>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Task Status Breakdown</span><Link to="/admin/tasks" className="btn btn-ghost btn-sm">View all →</Link></div>
          {[
            { status: 'ASSIGNED', label: 'Assigned', cls: 'badge-assigned' },
            { status: 'IN_PROGRESS', label: 'In Progress', cls: 'badge-in_progress' },
            { status: 'COMPLETED', label: 'Completed', cls: 'badge-completed' },
          ].map(row => (
            <div key={row.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--sap-border)' }}>
              <span className={`badge ${row.cls}`}>{row.label}</span>
              <strong style={{ fontSize: 18 }}>{getTaskCount(row.status)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div className="card">
        <div className="card-header"><span className="card-title">Quick Access</span></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/admin/users" className="btn btn-ghost">👥 All Users</Link>
          <Link to="/admin/mentorships" className="btn btn-ghost">🔗 Assignments</Link>
          <Link to="/admin/goals" className="btn btn-ghost">🎯 Goals</Link>
          <Link to="/admin/tasks" className="btn btn-ghost">✅ Tasks</Link>
          <Link to="/admin/sessions" className="btn btn-ghost">📅 Sessions</Link>
        </div>
      </div>
    </div>
  );
}
