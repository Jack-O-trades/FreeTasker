import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProjects, createProject } from '../api';
import { useAuth } from '../AuthContext';
import { PlusCircle, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', required_skills: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyProjects()
      .then((r) => setProjects(r.data.results || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const skills = form.required_skills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await createProject({ ...form, budget: Number(form.budget), required_skills: skills });
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ title: '', description: '', budget: '', deadline: '', required_skills: '' });
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = { open: 'success', in_progress: 'info', completed: 'teal', cancelled: 'danger', closed: 'warning' };

  return (
    <div className="page container animate-in">
      <div className="page-header flex justify-between items-center bg-white p-8 rounded-lg shadow-sm mb-8" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '32px 40px', border: '1px solid var(--border)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 28 }}>Welcome back, {user?.first_name || user?.username}</h1>
          <p className="page-subtitle">Here is what's happening with your projects today.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)}>
          <PlusCircle size={18} /> Post a Project
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-8">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">{projects.length}</div>
              <div className="stat-label">Total Projects</div>
            </div>
            <FileText className="text-teal" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-success">{projects.filter((p) => p.status === 'open').length}</div>
              <div className="stat-label">Open / Hiring</div>
            </div>
            <CheckCircle2 className="text-success" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-info">{projects.filter((p) => p.status === 'in_progress').length}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <Clock className="text-info" opacity={0.5} size={32} />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <h2 style={{ fontSize: 24, marginBottom: 20, color: '#111827' }}>Manage Projects</h2>
      {loading ? (
        <div className="spinner" />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="text-muted mx-auto mb-4" />
          <h3>Let's get started on your next project!</h3>
          <p className="mb-6">Connect with thousands of professionals ready to work.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Post a Project</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.map((p) => (
            <div key={p.id} className="card hover:shadow-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: 24 }}>
                <div className="flex items-center gap-3 mb-2">
                  <Link to={`/projects/${p.id}`} className="hover:text-teal transition-colors" style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>
                    {p.title}
                  </Link>
                  <span className={`badge badge-${statusColors[p.status] || 'teal'}`}>{p.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-4 text-sm text-muted font-medium">
                  <span className="text-primary">₹{Number(p.budget).toLocaleString()} Fixed</span>
                  <span>Ends {new Date(p.deadline).toLocaleDateString()}</span>
                  <span>{p.total_bids} Proposals</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/projects/${p.id}`} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>View Detail</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div className="card-glass animate-in" style={{ width: '100%', maxWidth: 600, padding: 40 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 style={{ fontSize: 24 }}>Tell us what you need done</h2>
              <button className="btn btn-outline btn-sm" style={{ border: 'none', color: '#6b7280' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Project Title</label>
                <input className="form-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Build a Responsive Website" required />
              </div>
              <div className="form-group">
                <label className="form-label">Project Description</label>
                <textarea className="form-textarea" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe your project, timeline, and goals in detail..." required style={{ minHeight: 120 }} />
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Budget (₹)</label>
                  <input className="form-input" type="number" min={500} value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Min ₹500" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input className="form-input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input className="form-input" value={form.required_skills} onChange={(e) => set('required_skills', e.target.value)} placeholder="e.g. React, Django, Graphic Design" />
                <span className="text-xs text-muted mt-1">Separate skills with commas.</span>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Posting...' : 'Post Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
