import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Mentor
import MentorDashboard from './pages/mentor/Dashboard';
import MentorGoals from './pages/mentor/Goals';
import MentorTasks from './pages/mentor/Tasks';
import MentorSessions from './pages/mentor/Sessions';

// Mentee
import MenteeDashboard from './pages/mentee/Dashboard';
import MenteeGoals from './pages/mentee/Goals';
import MenteeTasks from './pages/mentee/Tasks';

// Shared
import ChatPage from './pages/Chat';
import Profile from './pages/Profile';
import CalendarPage from './pages/mentor/Sessions';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import { AdminMentorships, AdminGoals, AdminTasks, AdminSessions } from './pages/admin/AdminPages';

// Mentee calendar (reuses same component with user-aware logic)
import MenteeSessions from './pages/mentor/Sessions';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', color: 'var(--sap-text-3)' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const RoleRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'MENTOR') return <Navigate to="/mentor" replace />;
  return <Navigate to="/mentee" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Mentor */}
          <Route path="/mentor" element={<ProtectedRoute role="MENTOR"><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/goals" element={<ProtectedRoute role="MENTOR"><MentorGoals /></ProtectedRoute>} />
          <Route path="/mentor/tasks" element={<ProtectedRoute role="MENTOR"><MentorTasks /></ProtectedRoute>} />
          <Route path="/mentor/sessions" element={<ProtectedRoute role="MENTOR"><MentorSessions /></ProtectedRoute>} />
          <Route path="/mentor/chat" element={<ProtectedRoute role="MENTOR"><ChatPage /></ProtectedRoute>} />
          <Route path="/mentor/profile" element={<ProtectedRoute role="MENTOR"><Profile /></ProtectedRoute>} />
          <Route path="/mentor/mentees" element={<ProtectedRoute role="MENTOR"><MentorDashboard /></ProtectedRoute>} />

          {/* Mentee */}
          <Route path="/mentee" element={<ProtectedRoute role="MENTEE"><MenteeDashboard /></ProtectedRoute>} />
          <Route path="/mentee/mentors" element={<ProtectedRoute role="MENTEE"><MenteeDashboard /></ProtectedRoute>} />
          <Route path="/mentee/goals" element={<ProtectedRoute role="MENTEE"><MenteeGoals /></ProtectedRoute>} />
          <Route path="/mentee/tasks" element={<ProtectedRoute role="MENTEE"><MenteeTasks /></ProtectedRoute>} />
          <Route path="/mentee/sessions" element={<ProtectedRoute role="MENTEE"><MenteeSessions /></ProtectedRoute>} />
          <Route path="/mentee/chat" element={<ProtectedRoute role="MENTEE"><ChatPage /></ProtectedRoute>} />
          <Route path="/mentee/profile" element={<ProtectedRoute role="MENTEE"><Profile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/mentorships" element={<ProtectedRoute role="ADMIN"><AdminMentorships /></ProtectedRoute>} />
          <Route path="/admin/goals" element={<ProtectedRoute role="ADMIN"><AdminGoals /></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute role="ADMIN"><AdminTasks /></ProtectedRoute>} />
          <Route path="/admin/sessions" element={<ProtectedRoute role="ADMIN"><AdminSessions /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
