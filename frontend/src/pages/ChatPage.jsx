import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChatRooms, getChatMessages } from '../api';
import { useAuth } from '../AuthContext';
import { Send, Search, Bot, MessageSquare } from 'lucide-react';
const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8001/ws/chat';

export default function ChatPage() {
  const { t } = useTranslation();
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
    const wsUrl = `${WS_BASE}/${roomId}/?token=${token}`;
    console.log('Connecting WebSocket to:', wsUrl);
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
      setWsStatus('connected');
    };
    socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setWsStatus('disconnected');
    };
    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      setWsStatus('error');
      setWarn('Connection error: Unable to connect to chat server');
    };
    socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log('Received message:', data);
        if (data.type === 'message') {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === 'warning') {
          setWarn(data.message);
          setTimeout(() => setWarn(''), 5000);
        } else if (data.type === 'error') {
          setWarn(data.message);
          setTimeout(() => setWarn(''), 5000);
        }
      } catch (err) {
        console.error('Error parsing message:', err);
      }
    };
  };

  const sendMessage = () => {
    if (!input.trim()) {
      setWarn('Message cannot be empty');
      return;
    }
    if (!ws.current) {
      setWarn('WebSocket connection not established');
      return;
    }
    if (ws.current.readyState !== WebSocket.OPEN) {
      setWarn(`Cannot send message. Connection status: ${ws.current.readyState === WebSocket.CONNECTING ? 'connecting' : ws.current.readyState === WebSocket.CLOSING ? 'closing' : 'closed'}`);
      return;
    }
    console.log('Sending message:', input.trim());
    ws.current.send(JSON.stringify({ message: input.trim() }));
    setInput('');
    setWarn('');
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
        <div className="chat-sidebar" style={{ borderRight: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-dark-theme" style={{ fontSize: 20, marginBottom: 16 }}>{t('chat.messages_title')}</h2>
            <div style={{ position: 'relative' }}>
              <Search size={16} className="text-muted" style={{ position: 'absolute', top: 10, left: 12 }} />
              <input className="form-input" style={{ paddingLeft: 36, background: 'var(--bg-secondary)', border: 'none' }} placeholder={t('chat.search_placeholder')} />
            </div>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {rooms.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                {t('chat.no_conversations')}
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: activeRoom?.id === room.id ? 'var(--accent-teal-dim)' : 'transparent',
                    borderLeft: activeRoom?.id === room.id ? '4px solid var(--accent-teal)' : '4px solid transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: activeRoom?.id === room.id ? 'var(--accent-teal)' : 'var(--text-primary)' }}>{getRoomLabel(room)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{getOtherName(room)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main chat */}
        {activeRoom ? (
          <>
          <div className="chat-main" style={{ background: 'var(--bg-secondary)' }}>
            <div className="chat-header" style={{ padding: '20px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 18 }}>
                  {getOtherName(activeRoom).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-dark-theme" style={{ fontWeight: 700, fontSize: 18 }}>{getOtherName(activeRoom)}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: wsStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }} />
                    {wsStatus === 'connected' ? t('chat.online') : t('chat.offline')} • <span className="text-teal font-semibold">{getOtherEmail(activeRoom)}</span> • {getRoomLabel(activeRoom)}
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
                      {msg.flagged && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Bot size={12} /> {t('chat.flagged_by_bot')}</div>}
                      <div className="msg-meta" style={{ textAlign: isMine ? 'right' : 'left' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEnd} />
            </div>

            {warn && <div className="msg-warn" style={{ margin: '0 24px 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Bot size={16} /> {warn}</div>}

            <div className="chat-input-area" style={{ padding: '20px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
              <textarea
                className="chat-input"
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.type_placeholder')}
                style={{ borderRadius: 24, padding: '12px 20px', background: 'var(--bg-secondary)', border: 'none', color: 'var(--text-primary)' }}
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
          <div className="chat-profile" style={{ width: 320, borderLeft: '1px solid var(--border)', background: 'var(--bg-card)', padding: '24px', overflowY: 'auto', display: 'none', '@media (min-width: 1200px)': { display: 'block' } }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 32, margin: '0 auto 12px' }}>
                {getOtherName(activeRoom).charAt(0).toUpperCase()}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>{getOtherName(activeRoom)}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: wsStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }} />
                {wsStatus === 'connected' ? t('chat.online_now') : t('chat.offline')}
              </p>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
              <h4 style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, fontWeight: 700 }}>{t('chat.profile_details')}</h4>
              
              {(() => {
                const isClient = user?.role === 'client';
                const pType = isClient ? 'freelancer' : 'client';
                const profileData = isClient ? activeRoom.freelancer_profile : activeRoom.client_profile;
                
                if (!profileData) return <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('chat.profile_incomplete')}</p>;

                if (pType === 'freelancer') {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('chat.hourly_rate')}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16 }}>₹{profileData.hourly_rate || 0}/hr</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('chat.platform_rating')}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 16 }}>
                          ⭐ {profileData.avg_rating || t('reputation.na')}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('chat.completed_projects')}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 16 }}>{profileData.completed_projects || 0}</div>
                      </div>
                      {profileData.skills && profileData.skills.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t('chat.key_skills')}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                             {profileData.skills.map(s => <span key={s} style={{ background: 'var(--accent-teal-dim)', color: 'var(--accent-teal)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>{s}</span>)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('chat.company_name')}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{profileData.company_name || t('chat.individual_client')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('chat.verification_status')}</div>
                        {profileData.is_verified ? (
                          <span style={{ background: 'var(--success)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{t('chat.verified_payment')}</span>
                        ) : (
                          <span style={{ background: 'var(--warning)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, display: 'inline-block' }}>{t('chat.unverified')}</span>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{t('chat.client_rating')}</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                          ⭐ {profileData.avg_rating || t('reputation.na')} <span style={{ fontSize: 12, fontWeight: 'normal', color: 'var(--text-muted)' }}>({profileData.total_ratings || 0})</span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 24 }}>
               <h4 className="text-muted" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{t('chat.contact_mail')}</h4>
               <p className="text-sm font-semibold" style={{ color: 'var(--accent-teal)', wordBreak: 'break-all' }}>{getOtherEmail(activeRoom)}</p>
            </div>
          </div>
          
        </>
        ) : (
          <div className="chat-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
            <div className="empty-state" style={{ background: 'transparent', border: 'none' }}>
              <MessageSquare size={64} className="icon mx-auto mb-6" style={{ opacity: 0.3 }} />
              <h3 className="text-dark-theme" style={{ fontSize: 24, paddingBottom: 8 }}>{t('chat.select_convo_title')}</h3>
              <p>{t('chat.select_convo_subtitle')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
