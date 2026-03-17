import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      const res = await api.put('/auth/profile', form);
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
      setSuccess('Profile updated successfully');
    } catch (err) { setError(err.response?.data?.error || 'Update failed'); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Profile</span></div>
        <h1>My Profile</h1>
      </div>

      <div style={{ maxWidth: 540 }}>
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--sap-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: 'var(--sap-text-2)', fontSize: 13 }}>{user?.email}</div>
              <span className={`badge badge-${user?.role?.toLowerCase()}`} style={{ marginTop: 4 }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {user?.role === 'MENTOR' && user?.inviteCode && (
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header"><span className="card-title">Your Invite Code</span></div>
            <div className="invite-code-box">
              <div className="invite-code">{user.inviteCode}</div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }}
                onClick={() => navigator.clipboard.writeText(user.inviteCode)}>📋 Copy</button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header"><span className="card-title">Edit Profile</span></div>
          {success && <div className="alert alert-success">✓ {success}</div>}
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" placeholder="Tell others about yourself…"
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
