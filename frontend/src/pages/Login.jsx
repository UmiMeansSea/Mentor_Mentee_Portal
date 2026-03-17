import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'MENTOR') navigate('/mentor');
      else navigate('/mentee');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-mark">MP</div>
          <h1 className="auth-title">MentorPath</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@university.edu"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <hr className="divider" />

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--sap-text-2)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--sap-brand)', fontWeight: 500 }}>Register</Link>
        </p>

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--sap-bg)', borderRadius: 'var(--sap-radius)', fontSize: 12, color: 'var(--sap-text-3)' }}>
          <strong>Demo accounts:</strong><br />
          Admin: admin@mentorplatform.com / Admin@1234<br />
          Mentor: mentor@mentorplatform.com / Mentor@1234<br />
          Mentee: mentee@mentorplatform.com / Mentee@1234
        </div>
      </div>
    </div>
  );
}
