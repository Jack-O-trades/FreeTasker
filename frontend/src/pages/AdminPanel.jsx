import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getProfanityReports,
  actionProfanityReport,
  getAdminReports,
  actionReport,
  getAdminUsers,
  banUser,
} from '../api';
import { ShieldAlert, Flag, Users, CheckCircle, AlertTriangle, XCircle, Bot } from 'lucide-react';

const statusColors = {
  pending: 'warning',
  warned: 'info',
  banned: 'danger',
  dismissed: 'secondary',
  resolved: 'success',
  reviewing: 'info',
};

export default function AdminPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('profanity');
  const [profanity, setProfanity] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('');

  const tabs = [
    { id: 'profanity', label: t('admin.tab_profanity'), icon: <Bot size={18} /> },
    { id: 'reports', label: t('admin.tab_reports'), icon: <Flag size={18} /> },
    { id: 'users', label: t('admin.tab_users'), icon: <Users size={18} /> },
  ];

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
      <div className="admin-sidebar" style={{ background: 'var(--bg-card)', minHeight: '100vh', paddingTop: 32, borderRight: '1px solid var(--border)' }}>
        <div style={{ padding: '0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShieldAlert size={28} className="text-teal" />
          <span className="text-dark-theme" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22 }}>{t('admin.title')}</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {tabs.map((t) => (
            <div
              key={t.id}
              className={`admin-nav-item ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              style={{ color: tab === t.id ? 'var(--accent-teal)' : 'var(--text-muted)' }}
            >
              <span>{t.icon}</span>
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
            <div className="flex justify-between items-center mb-8 bg-card p-6 rounded-lg shadow-sm" style={{ padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <h1 className="page-title text-dark-theme" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Bot size={28} className="text-purple" /> {t('admin.profanity_title')}</h1>
                <p className="page-subtitle">{t('admin.profanity_subtitle')}</p>
              </div>
              <select className="form-select" style={{ width: 220, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="">{t('admin.all_statuses')}</option>
                <option value="pending">{t('admin.needs_review')}</option>
                <option value="warned">{t('admin.warned')}</option>
                <option value="banned">{t('admin.banned')}</option>
                <option value="dismissed">{t('admin.dismissed')}</option>
              </select>
            </div>

            {loading ? <div className="spinner" /> : profanity.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} className="text-success mx-auto mb-4" />
                <h3 className="text-dark-theme">{t('admin.no_flagged')}</h3>
                <p>{t('admin.clean_safe')}</p>
              </div>
            ) : (
              <div className="table-wrapper" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin.table.user')}</th>
                      <th>{t('admin.table.source')}</th>
                      <th>{t('admin.table.content')}</th>
                      <th>{t('admin.table.flags')}</th>
                      <th>{t('admin.table.status')}</th>
                      <th>{t('admin.table.date')}</th>
                      <th>{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profanity.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td>
                          <div className="font-semibold text-dark-theme">{r.user_email}</div>
                          <div className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>{r.user_role}</div>
                        </td>
                        <td><span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{r.content_type}</span></td>
                        <td style={{ maxWidth: 260 }}>
                          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 6, fontSize: 13, color: 'var(--text-primary)', fontStyle: 'italic' }}>
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
                        <td><span className={`badge badge-${statusColors[r.status] || 'warning'}`}>{t(`admin.${r.status}`) || r.status}</span></td>
                        <td className="text-muted text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="btn btn-warning btn-sm"
                                disabled={actionLoading === r.id + 'warn'}
                                onClick={() => handleProfanityAction(r.id, 'warn')}
                              >{t('admin.actions.warn')}</button>
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === r.id + 'ban'}
                                onClick={() => handleProfanityAction(r.id, 'ban')}
                              >{t('admin.actions.ban')}</button>
                              <button
                                className="btn btn-secondary btn-sm"
                                disabled={actionLoading === r.id + 'dismiss'}
                                onClick={() => handleProfanityAction(r.id, 'dismiss')}
                              >{t('admin.actions.dismiss')}</button>
                            </div>
                          ) : (
                            <span className="text-muted text-sm flex items-center gap-1"><CheckCircle size={14} /> {t('admin.actions.reviewed')}</span>
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
            <div className="mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius-md)' }}>
              <h1 className="page-title text-dark-theme" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Flag size={28} className="text-warning" /> {t('admin.reports_title')}</h1>
              <p className="page-subtitle">{t('admin.reports_subtitle')}</p>
            </div>
            {loading ? <div className="spinner" /> : reports.length === 0 ? (
              <div className="empty-state"><CheckCircle size={48} className="text-success mx-auto mb-4" /><h3 className="text-dark-theme">{t('admin.tab_reports')}</h3></div>
            ) : (
              <div className="table-wrapper" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin.table.reporter')}</th>
                      <th>{t('admin.table.reported')}</th>
                      <th>{t('admin.table.reason')}</th>
                      <th>{t('admin.table.description')}</th>
                      <th>{t('admin.table.status')}</th>
                      <th>{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="font-semibold text-dark-theme">{r.reporter_email}</td>
                        <td className="font-semibold text-dark-theme">{r.reported_user_email}</td>
                        <td><span className="badge badge-warning">{r.reason}</span></td>
                        <td className="text-primary-theme" style={{ maxWidth: 240, fontSize: 14 }}>{r.description}</td>
                        <td><span className={`badge badge-${statusColors[r.status] || 'warning'}`}>{t(`admin.${r.status}`) || r.status}</span></td>
                        <td>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleReportAction(r.id, 'resolve')}>{t('admin.actions.resolve')}</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleReportAction(r.id, 'dismiss')}>{t('admin.actions.dismiss')}</button>
                            </div>
                          ) : <span className="text-muted text-sm">{t('admin.actions.reviewed')}</span>}
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
            <div className="mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: 24, borderRadius: 'var(--radius-md)' }}>
              <h1 className="page-title text-dark-theme" style={{ fontSize: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Users size={28} className="text-primary" /> {t('admin.users_title')}</h1>
              <p className="page-subtitle">{t('admin.users_subtitle')}</p>
            </div>
            {loading ? <div className="spinner" /> : (
              <div className="table-wrapper" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <table>
                  <thead>
                    <tr>
                      <th>{t('admin.table.user')}</th>
                      <th>{t('admin.table.role')}</th>
                      <th>{t('admin.table.warnings')}</th>
                      <th>{t('admin.table.status')}</th>
                      <th>{t('admin.table.joined')}</th>
                      <th>{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td>
                          <div className="font-semibold text-dark-theme">{u.email}</div>
                          <div className="text-xs text-muted">@{u.username}</div>
                        </td>
                        <td><span className={`badge badge-${u.role === 'admin' ? 'purple' : u.role === 'client' ? 'info' : 'teal'}`}>{u.role}</span></td>
                        <td>
                          {u.warnings_count > 0
                            ? <span className="badge badge-warning flex items-center gap-1 w-fit"><AlertTriangle size={12} /> {u.warnings_count} {t('admin.table.warnings')}</span>
                            : <span className="text-muted text-sm">0</span>
                          }
                        </td>
                        <td>
                          {u.is_banned
                            ? <span className="badge badge-danger">{t('admin.banned')}</span>
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
                              >{t('admin.actions.unban')}</button>
                            ) : (
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={actionLoading === u.id + 'ban'}
                                onClick={() => handleBanUser(u.id, 'ban')}
                              >{t('admin.actions.ban_user')}</button>
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

