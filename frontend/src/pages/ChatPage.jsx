import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatRooms, getChatMessages } from '../api';
import { useAuth } from '../AuthContext';
import { Send, Search, Bot, MessageSquare } from 'lucide-react';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8001/ws/chat';

export default function ChatPage() {
  const { user } = useAuth();
  const { roomId: paramRoomId } = useParams();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [warn, setWarn] = useState('');

  const ws = useRef(null);
  const messagesEnd = useRef(null);

  // Fetch rooms
  useEffect(() => {
    getChatRooms()
      .then((r) => {
        const data = r.data.results || r.data;
        setRooms(data);
        if (paramRoomId) {
          setActiveRoom(data.find((rm) => String(rm.id) === String(paramRoomId)) || data[0]);
        } else if (data.length > 0) {
          setActiveRoom(data[0]);
        }
      })
      .catch(() => {});
  }, [paramRoomId]);

  // Fetch messages + connect WS when room changes
  useEffect(() => {
    if (!activeRoom) return;
    setMessages([]);
    setWarn('');

    getChatMessages(activeRoom.id)
      .then((r) => setMessages(r.data.results || r.data))
      .catch(() => {});

    connectWs(activeRoom.id);
    return () => ws.current?.close();
  }, [activeRoom]);

  // Scroll to bottom
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectWs = (roomId) => {
    ws.current?.close();
    const token = localStorage.getItem('access_token');
    const socket = new WebSocket(`${WS_BASE}/${roomId}/?token=${token}`);
    ws.current = socket;

    socket.onopen = () => setWsStatus('connected');
    socket.onclose = () => setWsStatus('disconnected');
    socket.onerror = () => setWsStatus('error');
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'message') {
        setMessages((prev) => [...prev, data]);
      } else if (data.type === 'warning') {
        setWarn(data.message);
        setTimeout(() => setWarn(''), 5000);
      } else if (data.type === 'error') {
        setWarn(data.message);
        setTimeout(() => setWarn(''), 5000);
      }
    };
  };

  const sendMessage = () => {
    if (!input.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(JSON.stringify({ message: input.trim() }));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getRoomLabel = (room) => room.project_title || `Room #${room.id}`;

  const getOtherName = (room) => {
    if (user?.role === 'client') return room.freelancer_name || 'Freelancer';
    return room.client_name || 'Client';
  };

  const getOtherEmail = (room) => {
    if (user?.role === 'client') return room.freelancer_email || '';
    return room.client_email || '';
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', height: 'calc(100vh - 70px)' }}>
      <div className="chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar" style={{ borderRight: '1px solid var(--border)', background: '#ffffff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Messages</h2>
            <div style={{ position: 'relative' }}>
              <Search size={16} className="text-muted" style={{ position: 'absolute', top: 10, left: 12 }} />
              <input className="form-input" style={{ paddingLeft: 36, background: '#f9fafb', border: 'none' }} placeholder="Search messages" />
            </div>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {rooms.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No active conversations yet.
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: activeRoom?.id === room.id ? '#f0fdf4' : 'transparent',
                    borderLeft: activeRoom?.id === room.id ? '4px solid var(--accent-teal)' : '4px solid transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: activeRoom?.id === room.id ? '#065f46' : '#111827' }}>{getRoomLabel(room)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{getOtherName(room)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main chat */}
        {activeRoom ? (
          <>
          <div className="chat-main" style={{ background: '#f9fafb' }}>
            <div className="chat-header" style={{ padding: '20px 24px', background: '#ffffff', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                  {getOtherName(activeRoom).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>{getOtherName(activeRoom)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: wsStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }} />
                    {wsStatus === 'connected' ? 'Online' : 'Disconnected'} • <span className="text-teal font-semibold">{getOtherEmail(activeRoom)}</span> • {getRoomLabel(activeRoom)}
                  </div>
                </div>
              </div>
            </div>

            <div className="chat-messages" style={{ padding: '32px 24px' }}>
              {messages.map((msg, i) => {
                const isMine = String(msg.sender_id) === String(user?.id);
                return (
                  <div key={msg.message_id || i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 2 }}>
                    <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'} ${msg.flagged ? 'flagged' : ''}`}>
                      {!isMine && (
                        <div style={{ fontSize: 12, color: 'var(--accent-teal)', fontWeight: 600, marginBottom: 4 }}>
                          {msg.sender_name}
                        </div>
                      )}
                      <div style={{ wordBreak: 'break-word' }}>{msg.message || msg.content}</div>
                      {msg.flagged && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Bot size={12} /> Flagged by moderation bot</div>}
                      <div className="msg-meta" style={{ textAlign: isMine ? 'right' : 'left' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEnd} />
            </div>

            {warn && <div className="msg-warn" style={{ margin: '0 24px 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={16} /> {warn}</div>}

            <div className="chat-input-area" style={{ padding: '20px 24px', background: '#ffffff', borderTop: '1px solid var(--border)' }}>
              <textarea
                className="chat-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                style={{ borderRadius: 24, padding: '12px 20px', background: '#f3f4f6', border: 'none' }}
              />
              <button 
                className="btn btn-primary" 
                onClick={sendMessage} 
                disabled={!input.trim()}
                style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          {/* Third Column: Profile Widget */}
          <div className="chat-profile" style={{ width: 320, borderLeft: '1px solid var(--border)', background: '#ffffff', padding: '32px 24px', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 32, margin: '0 auto 16px' }}>
                {getOtherName(activeRoom).charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontSize: 20, marginBottom: 4 }}>{getOtherName(activeRoom)}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: wsStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }} />
                {wsStatus === 'connected' ? 'Online Now' : 'Offline'}
              </p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 16 }}>Profile Details</h4>
              
              {(() => {
                const isClient = user?.role === 'client';
                const pType = isClient ? 'freelancer' : 'client';
                const data = isClient ? activeRoom.freelancer_profile : activeRoom.client_profile;
                
                if (!data) return <p className="text-muted text-sm">Profile incomplete.</p>;

                if (pType === 'freelancer') {
                  return (
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-xs text-muted mb-1">Hourly Rate</div>
                        <div className="font-semibold text-primary">₹{data.hourly_rate || 0}/hr</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1">Platform Rating</div>
                        <div className="font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          ⭐ {data.avg_rating || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1">Completed Projects</div>
                        <div className="font-semibold text-primary">{data.completed_projects || 0}</div>
                      </div>
                      {data.skills && data.skills.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div className="text-xs text-muted mb-2">Key Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {data.skills.map(s => <span key={s} className="tag" style={{ background: '#f3f4f6', color: '#4b5563', padding: '4px 10px', borderRadius: 100, fontSize: 12, border: '1px solid var(--border)' }}>{s}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div className="flex flex-col gap-4">
                      <div>
                        <div className="text-xs text-muted mb-1">Company Name</div>
                        <div className="font-semibold text-primary">{data.company_name || 'Individual Client'}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1">Verification Status</div>
                        {data.is_verified ? (
                          <span className="badge badge-success">Verified Payment</span>
                        ) : (
                          <span className="badge badge-warning">Unverified</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-muted mb-1">Client Rating</div>
                        <div className="font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          ⭐ {data.avg_rating || 'N/A'} <span className="text-xs font-normal text-muted">({data.total_ratings || 0})</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 24 }}>
               <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 12 }}>Contact & Direct Mail</h4>
               <p className="text-sm font-semibold" style={{ color: 'var(--accent-teal)', wordBreak: 'break-all' }}>{getOtherEmail(activeRoom)}</p>
            </div>
          </div>
          
        </>
        ) : (
          <div className="chat-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
            <div className="empty-state" style={{ background: 'transparent', border: 'none' }}>
              <MessageSquare size={64} className="text-muted mx-auto mb-6" style={{ opacity: 0.3 }} />
              <h3 style={{ fontSize: 24, color: '#374151', paddingBottom: 8 }}>Your Messages</h3>
              <p>Select a conversation from the sidebar to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
