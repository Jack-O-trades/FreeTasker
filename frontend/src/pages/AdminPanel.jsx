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

  const getTabLabel = () => {
    return tabs.find(t => t.id === tab)?.label || t('admin.title');
  };

  return (
    <div className="admin-layout" style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Mobile Header */}
      <div style={{ display: 'none', '@media (max-width: 768px)': { display: 'flex' }, background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '16px', alignItems: 'center', justifyContent: 'space-between' }} className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={24} className="text-teal" />
          <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{t('admin.title')}</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: 8, display: 'flex' }}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Breadcrumb */}
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-secondary)', overflowX: 'auto' }}>
        <Home size={16} style={{ color: 'var(--accent-teal)' }} />
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t('admin.title')}</span>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{getTabLabel()}</span>
      </div>

      <div style={{ display: 'flex', gap: 0, minHeight: 'calc(100vh - 70px)' }}>
        {/* Sidebar */}
        <div 
          className="admin-sidebar"
          style={{ 
            background: 'var(--bg-card)', 
            borderRight: '1px solid var(--border)',
            paddingTop: 24,
            width: '280px',
            overflow: 'hidden',
            transition: 'var(--transition)',
            position: 'relative',
            '@media (max-width: 768px)': {
              position: 'fixed',
              left: sidebarOpen ? 0 : '-280px',
              top: '70px',
              zIndex: 999,
              height: 'calc(100vh - 70px)',
              borderRight: '1px solid var(--border)',
            }
          }}
        >
          <div style={{ padding: '0 20px 20px', display: 'none', '@media (max-width: 768px)': { display: 'block' } }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>{t('admin.title')}</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setSidebarOpen(false);
                }}
                style={{
                  padding: '12px 20px',
                  cursor: 'pointer',
                  color: tab === t.id ? 'var(--accent-teal)' : 'var(--text-secondary)',
                  background: tab === t.id ? 'var(--accent-teal-dim)' : 'transparent',
                  borderLeft: tab === t.id ? '4px solid var(--accent-teal)' : '4px solid transparent',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: 15,
                  fontWeight: tab === t.id ? 600 : 500,
                }}
              >
                {t.icon}
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            style={{
              display: 'none',
              '@media (max-width: 768px)': { display: 'block' },
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 998,
              animation: 'fadeIn 0.2s ease',
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Content */}
        <div className="admin-content" style={{ flex: 1, padding: '32px 20px', overflow: 'auto' }}>
        {/* Profanity Reports Tab */}
        {tab === 'profanity' && (
          <>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16, '@media (max-width: 768px)': { padding: '12px' } }}>
              <div>
                <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                  <Bot size={24} style={{ color: 'var(--accent-purple)' }} /> {t('admin.profanity_title')}
                </h1>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{t('admin.profanity_subtitle')}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, '@media (min-width: 640px)': { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' } }}>
                <select 
                  className="form-select" 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ 
                    background: 'var(--bg-secondary)', 
                    color: 'var(--text-primary)', 
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    fontSize: 14,
                    cursor: 'pointer',
                    width: '100%',
                    '@media (min-width: 640px)': { width: 220 }
                  }}
                >
                  <option value="">{t('admin.all_statuses')}</option>
                  <option value="pending">{t('admin.needs_review')}</option>
                  <option value="warned">{t('admin.warned')}</option>
                  <option value="banned">{t('admin.banned')}</option>
                  <option value="dismissed">{t('admin.dismissed')}</option>
                </select>
              </div>
            </div>

            {loading ? <div className="spinner" /> : profanity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{t('admin.no_flagged')}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{t('admin.clean_safe')}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.user')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.source')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.content')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.flags')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.status')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.date')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profanity.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.user_email}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{r.user_role}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)' }}><span style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{r.content_type}</span></td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 200 }}>
                          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 6, fontStyle: 'italic', wordBreak: 'break-word' }}>
                            "{r.content_snippet?.slice(0, 80)}{r.content_snippet?.length > 80 ? '...' : ''}"
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 120 }}>
                            {(r.detected_words || []).slice(0, 2).map((w) => (
                              <span key={w} style={{ background: 'var(--danger)', color: 'white', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: 11, fontWeight: 600 }}>{w}</span>
                            ))}
                            {(r.detected_words || []).length > 2 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{(r.detected_words || []).length - 2}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          <span style={{ background: `var(--${statusColors[r.status] || 'warning'}-dim)`, color: `var(--${statusColors[r.status] || 'warning'})`, padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {t(`admin.${r.status}`) || r.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button
                                style={{
                                  background: 'var(--warning)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: actionLoading === r.id + 'warn' ? 0.6 : 1,
                                  transition: 'var(--transition)',
                                }}
                                disabled={actionLoading === r.id + 'warn'}
                                onClick={() => handleProfanityAction(r.id, 'warn')}
                              >{t('admin.actions.warn')}</button>
                              <button
                                style={{
                                  background: 'var(--danger)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: actionLoading === r.id + 'ban' ? 0.6 : 1,
                                  transition: 'var(--transition)',
                                }}
                                disabled={actionLoading === r.id + 'ban'}
                                onClick={() => handleProfanityAction(r.id, 'ban')}
                              >{t('admin.actions.ban')}</button>
                              <button
                                style={{
                                  background: 'var(--border)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border)',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: actionLoading === r.id + 'dismiss' ? 0.6 : 1,
                                  transition: 'var(--transition)',
                                }}
                                disabled={actionLoading === r.id + 'dismiss'}
                                onClick={() => handleProfanityAction(r.id, 'dismiss')}
                              >{t('admin.actions.dismiss')}</button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle size={14} /> {t('admin.actions.reviewed')}
                            </span>
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

        {/* Reports Tab */}
        {tab === 'reports' && (
          <>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 24 }}>
              <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <Flag size={24} style={{ color: 'var(--warning)' }} /> {t('admin.reports_title')}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{t('admin.reports_subtitle')}</p>
            </div>
            {loading ? <div className="spinner" /> : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{t('admin.tab_reports')}</h3>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.reporter')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.reported')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.reason')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.description')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.status')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{r.reporter_email}</td>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)', fontWeight: 600 }}>{r.reported_user_email}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}><span style={{ background: 'var(--warning)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600 }}>{r.reason}</span></td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 180, wordBreak: 'break-word' }}>{r.description}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          <span style={{ background: `var(--${statusColors[r.status] || 'warning'}-dim)`, color: `var(--${statusColors[r.status] || 'warning'})`, padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {t(`admin.${r.status}`) || r.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <button 
                                style={{
                                  background: 'var(--success)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'var(--transition)',
                                }}
                                onClick={() => handleReportAction(r.id, 'resolve')}
                              >{t('admin.actions.resolve')}</button>
                              <button 
                                style={{
                                  background: 'var(--border)',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border)',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'var(--transition)',
                                }}
                                onClick={() => handleReportAction(r.id, 'dismiss')}
                              >{t('admin.actions.dismiss')}</button>
                            </div>
                          ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t('admin.actions.reviewed')}</span>}
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
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: 24 }}>
              <h1 style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
                <Users size={24} style={{ color: 'var(--info)' }} /> {t('admin.users_title')}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>{t('admin.users_subtitle')}</p>
            </div>
            {loading ? <div className="spinner" /> : (
              <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.user')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.role')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.warnings')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.status')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.joined')}</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('admin.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px', fontSize: 14, color: 'var(--text-primary)' }}>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{u.email}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>@{u.username}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          <span style={{ background: `var(--${u.role === 'admin' ? 'accent-purple' : u.role === 'client' ? 'info' : 'accent-teal'}-dim)`, color: `var(--${u.role === 'admin' ? 'accent-purple' : u.role === 'client' ? 'info' : 'accent-teal'})`, padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {u.warnings_count > 0
                            ? <span style={{ background: 'var(--warning)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                                <AlertTriangle size={12} /> {u.warnings_count}
                              </span>
                            : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>0</span>
                          }
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {u.is_banned
                            ? <span style={{ background: 'var(--danger)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{t('admin.banned')}</span>
                            : <span style={{ background: 'var(--success)', color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Active</span>
                          }
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(u.date_joined || u.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13 }}>
                          {u.role !== 'admin' && (
                            u.is_banned ? (
                              <button
                                style={{
                                  background: 'transparent',
                                  color: 'var(--text-primary)',
                                  border: '1px solid var(--border)',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: actionLoading === u.id + 'unban' ? 0.6 : 1,
                                  transition: 'var(--transition)',
                                }}
                                disabled={actionLoading === u.id + 'unban'}
                                onClick={() => handleBanUser(u.id, 'unban')}
                              >{t('admin.actions.unban')}</button>
                            ) : (
                              <button
                                style={{
                                  background: 'var(--danger)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: 'var(--radius-sm)',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  opacity: actionLoading === u.id + 'ban' ? 0.6 : 1,
                                  transition: 'var(--transition)',
                                }}
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
    </div>
  );
}

