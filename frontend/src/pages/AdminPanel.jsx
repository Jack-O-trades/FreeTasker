import React, { useEffect, useState } from 'react';
import {
  getProfanityReports,
  actionProfanityReport,
  getAdminReports,
  actionReport,
  getAdminUsers,
  banUser,
} from '../api';
import { ShieldAlert, Flag, Users, CheckCircle, AlertTriangle, XCircle, Bot } from 'lucide-react';

const tabs = [
  { id: 'profanity', label: 'Profanity Filter', icon: <Bot size={18} /> },
  { id: 'reports', label: 'User Reports', icon: <Flag size={18} /> },
  { id: 'users', label: 'Manage Users', icon: <Users size={18} /> },
];

const statusColors = {
  pending: 'warning',
  warned: 'info',
  banned: 'danger',
  dismissed: 'secondary',
  resolved: 'success',
  reviewing: 'info',
};

export default function AdminPanel() {
  const [tab, setTab] = useState('profanity');
  const [profanity, setProfanity] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    if (tab === 'profanity') {
      getProfanityReports(filter ? { status: filter } : {})
        .then((r) => setProfanity(r.data.results || r.data))
        .finally(() => setLoading(false));
    } else if (tab === 'reports') {
      getAdminReports()
        .then((r) => setReports(r.data.results || r.data))
        .finally(() => setLoading(false));
    } else {
      getAdminUsers()
        .then((r) => setUsers(r.data.results || r.data))
        .finally(() => setLoading(false));
    }
  }, [tab, filter]);

  const handleProfanityAction = async (id, action, notes = '') => {
    setActionLoading(id + action);
    try {
      await actionProfanityReport(id, { action, admin_notes: notes });
      setProfanity((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: action === 'dismiss' ? 'dismissed' : action === 'warn' ? 'warned' : 'banned' } : r)
      );
    } catch {}
    setActionLoading(null);
  };

  const handleReportAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await actionReport(id, { action });
      setReports((prev) =>
        prev.map((r) => r.id === id ? { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' } : r)
      );
    } catch {}
    setActionLoading(null);
  };

  const handleBanUser = async (userId, action) => {
    setActionLoading(userId + action);
    try {
      await banUser(userId, { action });
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, is_banned: action === 'ban' } : u)
      );
    } catch {}
    setActionLoading(null);
  };

  return (
    <div className="admin-layout" style={{ background: 'var(--bg-secondary)', minHeight: '100vh', margin: '-40px -24px 0', padding: 0 }}>
      {/* Sidebar */}
      <div className="admin-sidebar" style={{ background: '#ffffff', minHeight: '100vh', paddingTop: 32 }}>
        <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={28} className="text-teal" />
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: '#111827' }}>Moderation</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map((t) => (
            <div
              key={t.id}
              className={`admin-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span style={{ color: tab === t.id ? 'var(--accent-teal)' : 'var(--text-muted)' }}>{t.icon}</span>
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="admin-content animate-in" style={{ padding: '40px 48px' }}>
        {/* Profanity Reports Tab */}
        {tab === 'profanity' && (
          <>
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm" style={{ background: 'white', padding: 24, borderRadius: 'var(--radius-md)' }}>
              <div>
                <h1 className="page-title" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Bot size={28} className="text-purple" /> Auto-Flagged Content</h1>
                <p className="page-subtitle">AI bot flags from chat, projects, and proposals.</p>
              </div>
              <select className="form-select" style={{ width: 180, background: '#f9fafb' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Needs Review (Pending)</option>
                <option value="warned">Warned</option>
                <option value="banned">Banned</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            {loading ? <div className="spinner" /> : profanity.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} className="text-success mx-auto mb-4" />
                <h3>No flagged content</h3>
                <p>The platform is clean and safe!</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Source</th>
                      <th>Content Snippet</th>
                      <th>Flagged Words</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profanity.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="font-semibold">{r.user_email}</div>
                          <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{r.user_role}</div>
                        </td>
                        <td><span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{r.content_type}</span></td>
                        <td style={{ maxWidth: 260 }}>
                          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: '#991b1b', fontStyle: 'italic' }}>
                            "{r.content_snippet?.slice(0, 100)}{r.content_snippet?.length > 100 ? '...' : ''}"
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 150 }}>
                            {(r.detected_words || []).map((w) => (
                              <span key={w} className="badge badge-danger">{w}</span>
                            ))}
                          </div>
                        </td>
                        <td><span className={`badge badge-${statusColors[r.status] || 'warning'}`}>{r.status}</span></td>
                        <td className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="btn btn-warning btn-sm"
                                disabled={actionLoading === r.id + 'warn'}
                                onClick={() => handleProfanityAction(r.id, 'warn')}
                              >Warn</button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === r.id + 'ban'}
                                onClick={() => handleProfanityAction(r.id, 'ban')}
                              >Ban</button>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={actionLoading === r.id + 'dismiss'}
                                onClick={() => handleProfanityAction(r.id, 'dismiss')}
                              >Dismiss</button>
                            </div>
                          ) : (
                            <span className="text-muted text-sm flex items-center gap-1"><CheckCircle size={14} /> Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* User Reports Tab */}
        {tab === 'reports' && (
          <>
            <div className="mb-8" style={{ background: 'white', padding: 24, borderRadius: 'var(--radius-md)' }}>
              <h1 className="page-title" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Flag size={28} className="text-warning" /> User Reports</h1>
              <p className="page-subtitle">Reports filed by users against other users.</p>
            </div>
            {loading ? <div className="spinner" /> : reports.length === 0 ? (
              <div className="empty-state"><CheckCircle size={48} className="text-success mx-auto mb-4" /><h3>No active reports</h3></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Reported User</th>
                      <th>Reason</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td className="font-semibold">{r.reporter_email}</td>
                        <td className="font-semibold">{r.reported_user_email}</td>
                        <td><span className="badge badge-warning">{r.reason}</span></td>
                        <td style={{ maxWidth: 240, fontSize: 14 }}>{r.description}</td>
                        <td><span className={`badge badge-${statusColors[r.status] || 'warning'}`}>{r.status}</span></td>
                        <td>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleReportAction(r.id, 'resolve')}>Resolve</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleReportAction(r.id, 'dismiss')}>Dismiss</button>
                            </div>
                          ) : <span className="text-muted text-sm">Reviewed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <>
            <div className="mb-8" style={{ background: 'white', padding: 24, borderRadius: 'var(--radius-md)' }}>
              <h1 className="page-title" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Users size={28} className="text-primary" /> User Directory</h1>
              <p className="page-subtitle">View and moderate all registered platform users.</p>
            </div>
            {loading ? <div className="spinner" /> : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Warnings</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="font-semibold">{u.email}</div>
                          <div className="text-xs text-muted">@{u.username}</div>
                        </td>
                        <td><span className={`badge badge-${u.role === 'admin' ? 'purple' : u.role === 'client' ? 'info' : 'teal'}`}>{u.role}</span></td>
                        <td>
                          {u.warnings_count > 0
                            ? <span className="badge badge-warning flex items-center gap-1 w-fit"><AlertTriangle size={12} /> {u.warnings_count} Warnings</span>
                            : <span className="text-muted text-sm">0</span>
                          }
                        </td>
                        <td>
                          {u.is_banned
                            ? <span className="badge badge-danger">Banned</span>
                            : <span className="badge badge-success">Active</span>
                          }
                        </td>
                        <td className="text-muted text-sm">{new Date(u.date_joined || u.created_at).toLocaleDateString()}</td>
                        <td>
                          {u.role !== 'admin' && (
                            u.is_banned ? (
                              <button
                                className="btn btn-outline btn-sm"
                                disabled={actionLoading === u.id + 'unban'}
                                onClick={() => handleBanUser(u.id, 'unban')}
                              >Unban User</button>
                            ) : (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === u.id + 'ban'}
                                onClick={() => handleBanUser(u.id, 'ban')}
                              >Ban User</button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
