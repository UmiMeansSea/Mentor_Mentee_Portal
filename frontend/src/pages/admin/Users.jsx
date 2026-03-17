import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    api.get(`/admin/users?${params}`).then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Admin</span> / <span>Users</span></div>
        <h1>All Users</h1>
        <p>Manage all mentors and mentees on the platform</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input className="form-input" placeholder="Search by name or email…" style={{ flex: 1, minWidth: 200 }}
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input" style={{ width: 160 }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="MENTOR">Mentor</option>
            <option value="MENTEE">Mentee</option>
          </select>
          <button className="btn btn-primary" onClick={fetchUsers}>Search</button>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setRole(''); setTimeout(fetchUsers, 0); }}>Clear</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Users</span>
          <span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{users.length} results</span>
        </div>
        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sap-text-3)' }}>Loading…</div> : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Invite Code</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: 'var(--sap-text-2)' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td><code style={{ fontSize: 12, background: 'var(--sap-bg)', padding: '2px 6px', borderRadius: 3 }}>{u.inviteCode || '—'}</code></td>
                    <td style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
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
