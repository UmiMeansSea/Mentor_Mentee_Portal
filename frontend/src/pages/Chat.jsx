import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  // Init socket
  useEffect(() => {
    const token = localStorage.getItem('token');
    socketRef.current = io('/', { auth: { token }, transports: ['websocket'] });

    socketRef.current.on('message:receive', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    socketRef.current.on('message:sent', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    socketRef.current.on('typing:start', ({ userId }) => {
      if (userId === activeContact?.id) setTyping(true);
    });
    socketRef.current.on('typing:stop', ({ userId }) => {
      if (userId === activeContact?.id) setTyping(false);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  // Load contacts
  useEffect(() => {
    const endpoint = user?.role === 'MENTOR' ? '/mentorships/my-mentees' : '/mentorships/my-mentors';
    api.get(endpoint).then(r => {
      const list = user?.role === 'MENTOR'
        ? r.data.map(m => m.mentee)
        : r.data.map(m => m.mentor);
      setContacts(list);

      const preselect = searchParams.get('userId');
      if (preselect) {
        const found = list.find(c => c.id === preselect);
        if (found) setActiveContact(found);
      } else if (list.length > 0) {
        setActiveContact(list[0]);
      }
    });
  }, [user]);

  // Load messages when contact changes
  useEffect(() => {
    if (!activeContact) return;
    api.get(`/messages/${activeContact.id}`).then(r => setMessages(r.data));
    socketRef.current?.emit('messages:read', { senderId: activeContact.id });
  }, [activeContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !activeContact) return;
    socketRef.current?.emit('message:send', { receiverId: activeContact.id, content: input.trim() });
    setInput('');
    socketRef.current?.emit('typing:stop', { receiverId: activeContact.id });
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing:start', { receiverId: activeContact?.id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { receiverId: activeContact?.id });
    }, 1200);
  };

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div>
      <div className="page-header">
        <div className="breadcrumb"><span>Home</span> / <span>Messages</span></div>
        <h1>Messages</h1>
      </div>

      <div className="chat-container">
        {/* Contact list */}
        <div className="chat-sidebar">
          <div style={{ padding: '12px 1rem', borderBottom: '1px solid var(--sap-border)', fontWeight: 600, fontSize: 13 }}>
            Conversations
          </div>
          {contacts.map(c => (
            <div key={c.id} className={`chat-contact${activeContact?.id === c.id ? ' active' : ''}`}
              onClick={() => setActiveContact(c)}>
              <div className="chat-contact-avatar">{initials(c.name)}</div>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--sap-text-3)' }}>{c.email}</div>
              </div>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div style={{ fontSize: 28, opacity: 0.4 }}>💬</div>
              <div style={{ fontSize: 13, color: 'var(--sap-text-3)', marginTop: 8 }}>No contacts yet</div>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="chat-main">
          {activeContact ? (
            <>
              {/* Header */}
              <div style={{ padding: '12px 1rem', borderBottom: '1px solid var(--sap-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="chat-contact-avatar">{initials(activeContact.name)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{activeContact.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--sap-text-3)' }}>{activeContact.email}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <h3>Start the conversation</h3>
                    <p>Send your first message to {activeContact.name}</p>
                  </div>
                )}
                {messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.senderId === user?.id ? 'flex-end' : 'flex-start' }}>
                    <div className={`message-bubble ${m.senderId === user?.id ? 'message-mine' : 'message-theirs'}`}>
                      {m.content}
                      <div className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="typing-indicator">{activeContact.name} is typing…</div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-area" onSubmit={handleSend}>
                <input className="form-input" placeholder={`Message ${activeContact.name}…`}
                  value={input} onChange={handleTyping} autoComplete="off" />
                <button type="submit" className="btn btn-primary" disabled={!input.trim()}>Send</button>
              </form>
            </>
          ) : (
            <div className="empty-state" style={{ margin: 'auto' }}>
              <div className="empty-state-icon">💬</div>
              <h3>Select a conversation</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
