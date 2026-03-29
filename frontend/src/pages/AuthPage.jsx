import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { login as loginApi, register as registerApi, getMe } from '../api';
import { useAuth } from '../AuthContext';
import { Mail, Lock, User, Briefcase, Building } from 'lucide-react';

export default function AuthPage({ mode = 'login' }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    first_name: '',
    last_name: '',
    role: params.get('role') || 'freelancer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const redirectByRole = (role) => {
    if (role === 'admin') return navigate('/admin');
    if (role === 'client') return navigate('/dashboard');
    return navigate('/dashboard'); // freelancers also go to dashboard by default now
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
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#f9fafb' }}>
      
      <div className="card-glass animate-in" style={{ width: '100%', maxWidth: 480, padding: '40px 48px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
        <div className="text-center mb-8">
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Outfit', color: '#111827', marginBottom: 6 }}>
            Free<span className="text-teal">Tasker</span>
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </h1>
          <p className="text-muted text-sm">
            {mode === 'login' ? 'Welcome back! Please enter your details.' : 'Join to start finding work or hiring talent.'}
          </p>
        </div>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {mode === 'register' && (
            <>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="John" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Doe" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} className="text-muted" style={{ position: 'absolute', top: 12, left: 14 }} />
                  <input className="form-input" style={{ paddingLeft: 40 }} value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="johndoe" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label mb-2">I want to...</label>
                <div className="grid-2" style={{ gap: 12 }}>
                  <div 
                    onClick={() => setForm({ ...form, role: 'freelancer' })}
                    style={{ border: `2px solid ${form.role === 'freelancer' ? 'var(--accent-teal)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '16px', cursor: 'pointer', textAlign: 'center', background: form.role === 'freelancer' ? 'var(--bg-secondary)' : 'white' }}
                  >
                    <Briefcase size={24} className={form.role === 'freelancer' ? 'text-teal' : 'text-muted'} style={{ margin: '0 auto 8px' }} />
                    <div className="font-semibold text-sm">Find Work</div>
                  </div>
                  <div 
                    onClick={() => setForm({ ...form, role: 'client' })}
                    style={{ border: `2px solid ${form.role === 'client' ? 'var(--accent-teal)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', padding: '16px', cursor: 'pointer', textAlign: 'center', background: form.role === 'client' ? 'var(--bg-secondary)' : 'white' }}
                  >
                    <Building size={24} className={form.role === 'client' ? 'text-teal' : 'text-muted'} style={{ margin: '0 auto 8px' }} />
                    <div className="font-semibold text-sm">Hire Talent</div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="text-muted" style={{ position: 'absolute', top: 12, left: 14 }} />
              <input className="form-input" style={{ paddingLeft: 40 }} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', top: 12, left: 14 }} />
              <input className="form-input" style={{ paddingLeft: 40 }} type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg mt-2" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-sm font-semibold text-muted">
          {mode === 'login' ? (
            <>Don't have an account? <Link to="/register" className="text-teal hover:underline">Join FreeTasker</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-teal hover:underline">Sign In</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
