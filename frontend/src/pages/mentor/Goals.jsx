import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function MentorGoals() {
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [reviewGoalId, setReviewGoalId] = useState(null);

  useEffect(() => {
    api.get('/mentorships/my-mentees').then(r => {
      setMentees(r.data);
      if (r.data.length > 0) setSelectedMentee(r.data[0].mentee.id);
    });
  }, []);

  useEffect(() => {
    if (!selectedMentee) return;
    setLoading(true);
    api.get(`/goals/mentee/${selectedMentee}`).then(r => setGoals(r.data)).finally(() => setLoading(false));
  }, [selectedMentee]);

  const handleReview = async (goalId, status) => {
    await api.patch(`/goals/${goalId}/review`, { status, mentorNote: note });
    setGoals(goals.map(g => g.id === goalId ? { ...g, status, mentorNote: note } : g));
    setReviewGoalId(null); setNote('');
  };

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Goals Review</span></div>
        <h1>Goals Review</h1>
        <p>Review and approve your mentees' goals</p>
      </div>

      {/* Mentee selector */}
      {mentees.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {mentees.map(m => (
              <button key={m.mentee.id}
                className={`btn ${selectedMentee === m.mentee.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedMentee(m.mentee.id)}>
                {m.mentee.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Goals</span>
          <span style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{goals.length} total</span>
        </div>

        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--sap-text-3)' }}>Loading…</div> :
          goals.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🎯</div><h3>No goals submitted</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Goal</th><th>Description</th><th>Status</th><th>Mentor Note</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {goals.map(g => (
                    <tr key={g.id}>
                      <td style={{ fontWeight: 500 }}>{g.title}</td>
                      <td style={{ color: 'var(--sap-text-2)', maxWidth: 220 }}>{g.description || '—'}</td>
                      <td><span className={`badge badge-${g.status.toLowerCase()}`}>{g.status}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--sap-text-3)', maxWidth: 180 }}>{g.mentorNote || '—'}</td>
                      <td>
                        {g.status === 'PENDING' && (
                          reviewGoalId === g.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 200 }}>
                              <input className="form-input" placeholder="Optional note…" value={note} onChange={e => setNote(e.target.value)} />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleReview(g.id, 'APPROVED')}>✓ Approve</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleReview(g.id, 'REJECTED')}>✗ Reject</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setReviewGoalId(null)}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button className="btn btn-ghost btn-sm" onClick={() => setReviewGoalId(g.id)}>Review</button>
                          )
                        )}
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
