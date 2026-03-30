import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login as loginApi, register as registerApi, getMe } from '../api';
import { useAuth } from '../AuthContext';
import { Mail, Lock, User, Briefcase, Building } from 'lucide-react';

export default function AuthPage({ mode = 'login' }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    skills: '',
    role: params.get('role') || 'freelancer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const redirectByRole = (role) => {
    if (role === 'admin') return navigate('/admin');
    if (role === 'client') return navigate('/dashboard');
    return navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await loginApi(form.email, form.password);
        localStorage.setItem('access_token', res.data.access);
        const me = await (await import('../api')).getMe();
        login(me.data, res.data.access, res.data.refresh);
        redirectByRole(me.data.role);
      } else {
        const payload = { ...form, password2: form.password };
        if (payload.role === 'freelancer' && payload.skills) {
          payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          payload.skills = [];
        }
        await registerApi(payload);
        const loginRes = await loginApi(form.email, form.password);
        localStorage.setItem('access_token', loginRes.data.access);
        const meRes = await (await import('../api')).getMe();
        login(meRes.data, loginRes.data.access, loginRes.data.refresh);
        redirectByRole(meRes.data.role);
      }
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-secondary)' }}>
      
      <div className="card animate-in" style={{ width: '100%', maxWidth: 480, padding: '40px 48px', border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
        <div className="text-center mb-8">
          <div className="text-dark-theme" style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 6 }}>
            Free<span className="text-teal">Tasker</span>
          </div>
          <h1 className="text-dark-theme" style={{ fontSize: 28, marginBottom: 8 }}>
            {mode === 'login' ? t('auth.signin_title') : t('auth.signup_title')}
          </h1>
          <p className="text-muted text-sm">
            {mode === 'login' ? t('auth.signin_subtitle') : t('auth.signup_subtitle')}
          </p>
        </div>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {mode === 'register' && (
            <>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t('auth.first_name')}</label>
                  <input className="form-input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="John" required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.last_name')}</label>
                  <input className="form-input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Doe" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.username')}</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} className="text-muted" style={{ position: 'absolute', top: 12, left: 14 }} />
                  <input className="form-input" style={{ paddingLeft: 40 }} value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="johndoe" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label mb-2">{t('auth.i_want_to')}</label>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div 
                    onClick={() => setForm({ ...form, role: 'freelancer' })}
                    style={{ border: `2px solid ${form.role === 'freelancer' ? 'var(--accent-teal)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '16px', cursor: 'pointer', textAlign: 'center', background: form.role === 'freelancer' ? 'var(--accent-teal-dim)' : 'var(--bg-secondary)' }}
                  >
                    <Briefcase size={24} className={form.role === 'freelancer' ? 'text-teal' : 'text-muted'} style={{ margin: '0 auto 8px' }} />
                    <div className="font-semibold text-sm">{t('auth.find_work')}</div>
                  </div>
                  <div 
                    onClick={() => setForm({ ...form, role: 'client' })}
                    style={{ border: `2px solid ${form.role === 'client' ? 'var(--accent-teal)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '16px', cursor: 'pointer', textAlign: 'center', background: form.role === 'client' ? 'var(--accent-teal-dim)' : 'var(--bg-secondary)' }}
                  >
                    <Building size={24} className={form.role === 'client' ? 'text-teal' : 'text-muted'} style={{ margin: '0 auto 8px' }} />
                    <div className="font-semibold text-sm">{t('auth.hire_talent')}</div>
                  </div>
                </div>
              </div>
              
              {form.role === 'freelancer' && (
                <div className="form-group">
                  <label className="form-label">{t('auth.skills_label')}</label>
                  <input className="form-input" value={form.skills} onChange={(e) => set('skills', e.target.value)} placeholder="React, Python, Design" />
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="form-label">{t('auth.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="text-muted" style={{ position: 'absolute', top: 12, left: 14 }} />
              <input className="form-input" style={{ paddingLeft: 40 }} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', top: 12, left: 14 }} />
              <input className="form-input" style={{ paddingLeft: 40 }} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-2" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? t('auth.please_wait') : mode === 'login' ? t('auth.signin_btn') : t('auth.signup_btn')}
          </button>
        </form>

        <div className="divider" style={{ margin: '24px 0' }} />

        <p className="text-center text-sm font-semibold text-muted">
          {mode === 'login' ? (
            <>{t('auth.dont_have_account')} <Link to="/register" className="text-teal hover:underline">{t('auth.join_link')}</Link></>
          ) : (
            <>{t('auth.already_have_account')} <Link to="/login" className="text-teal hover:underline">{t('auth.signin_link')}</Link></>
          )}
        </p>
      </div>
    </div>
  );
}

