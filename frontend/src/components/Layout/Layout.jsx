import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navsByRole = {
  MENTOR: [
    { to: '/mentor', label: 'Dashboard', icon: '⊞', end: true },
    { to: '/mentor/mentees', label: 'My Mentees', icon: '👥' },
    { to: '/mentor/tasks', label: 'Tasks', icon: '✅' },
    { to: '/mentor/goals', label: 'Goals Review', icon: '🎯' },
    { to: '/mentor/sessions', label: 'Calendar', icon: '📅' },
    { to: '/mentor/chat', label: 'Messages', icon: '💬' },
    { to: '/mentor/profile', label: 'Profile', icon: '👤' },
  ],
  MENTEE: [
    { to: '/mentee', label: 'Dashboard', icon: '⊞', end: true },
    { to: '/mentee/mentors', label: 'My Mentors', icon: '🎓' },
    { to: '/mentee/goals', label: 'My Goals', icon: '🎯' },
    { to: '/mentee/tasks', label: 'My Tasks', icon: '✅' },
    { to: '/mentee/sessions', label: 'Calendar', icon: '📅' },
    { to: '/mentee/chat', label: 'Messages', icon: '💬' },
    { to: '/mentee/profile', label: 'Profile', icon: '👤' },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: '⊞', end: true },
    { to: '/admin/users', label: 'All Users', icon: '👥' },
    { to: '/admin/mentorships', label: 'Assignments', icon: '🔗' },
    { to: '/admin/goals', label: 'Goals', icon: '🎯' },
    { to: '/admin/tasks', label: 'Tasks', icon: '✅' },
    { to: '/admin/sessions', label: 'Sessions', icon: '📅' },
  ],
};

const roleLabels = { MENTOR: 'Mentor Portal', MENTEE: 'Mentee Portal', ADMIN: 'Admin Portal' };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navsByRole[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Shell Bar */}
      <div className="shell-bar">
        <div className="shell-logo">
          <div className="shell-logo-mark">MP</div>
          <span className="shell-product">MentorPath</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 4px' }}>|</span>
        <span className="shell-title">{roleLabels[user?.role]}</span>
        <div className="shell-spacer" />
        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginRight: 8 }}>{user?.name}</span>
        <div className="shell-avatar" onClick={handleLogout} title="Logout">{initials}</div>
      </div>

      <div className="app-layout">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="nav-section">
            <div className="nav-section-label">Navigation</div>
          </div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="sidebar-footer">
            <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>
              <div style={{ fontWeight: 500, color: 'var(--sap-text-2)', marginBottom: 2 }}>{user?.name}</div>
              <div>{user?.email}</div>
              <div style={{ marginTop: 4 }}>
                <span className={`badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main */}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
