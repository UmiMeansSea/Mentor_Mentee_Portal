import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function CalendarPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [form, setForm] = useState({ title: '', description: '', startTime: '', endTime: '', menteeId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/sessions').then(r => setSessions(r.data));
    if (user?.role === 'MENTOR') {
      api.get('/mentorships/my-mentees').then(r => setMentees(r.data));
    }
  }, [user]);

  const calendarEvents = sessions.map(s => ({
    id: s.id,
    title: `${s.title} — ${user?.role === 'MENTOR' ? s.mentee?.name : s.mentor?.name}`,
    start: s.startTime,
    end: s.endTime,
    backgroundColor: 'var(--sap-brand)',
    borderColor: 'var(--sap-brand-dark)',
  }));

  const handleDateClick = (info) => {
    if (user?.role !== 'MENTOR') return;
    const dt = info.dateStr + 'T09:00';
    setForm({ title: '', description: '', startTime: dt, endTime: info.dateStr + 'T10:00', menteeId: '' });
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      const res = await api.post('/sessions', form);
      setSessions([...sessions, res.data]);
      setShowModal(false);
    } catch (err) { setError(err.response?.data?.error || 'Failed to create session'); }
  };

  const handleEventClick = async (info) => {
    if (user?.role !== 'MENTOR') return;
    if (window.confirm(`Delete session: "${info.event.title}"?`)) {
      await api.delete(`/sessions/${info.event.id}`);
      setSessions(sessions.filter(s => s.id !== info.event.id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Calendar</span></div>
        <h1>Session Calendar</h1>
        <p>{user?.role === 'MENTOR' ? 'Click a date to schedule a session with a mentee' : 'View your scheduled sessions'}</p>
      </div>

      <div className="card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          editable={user?.role === 'MENTOR'}
        />
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Schedule Session</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="alert alert-error">⚠ {error}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Session Title</label>
                <input className="form-input" placeholder="e.g. Weekly Check-in"
                  value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-input" placeholder="Agenda…"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Mentee</label>
                <select className="form-input" value={form.menteeId} onChange={e => setForm({ ...form, menteeId: e.target.value })} required>
                  <option value="">Select mentee…</option>
                  {mentees.map(m => <option key={m.mentee.id} value={m.mentee.id}>{m.mentee.name}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="datetime-local" value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="datetime-local" value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
