import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyProjects, createProject } from '../api';
import { useAuth } from '../AuthContext';
import { PlusCircle, FileText, CheckCircle2, Clock, Wand2, Download } from 'lucide-react';

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', budget: '', deadline: '', required_skills: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.search.includes('post=1')) {
      setShowModal(true);
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

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
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('budget', Number(form.budget));
      formData.append('deadline', form.deadline);
      formData.append('required_skills', JSON.stringify(skills));
      
      if (pdfFile) {
        formData.append('attached_file', pdfFile);
      }

      const res = await createProject(formData);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ title: '', description: '', budget: '', deadline: '', required_skills: '' });
      setPdfFile(null);
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors = { open: 'success', in_progress: 'info', completed: 'teal', cancelled: 'danger', closed: 'warning' };

  const handleAIGenerate = () => {
    if (!pdfFile) {
      alert("Please upload a PDF first!");
      return;
    }
    if (!form.title) {
      alert("Please enter a Project Title first so the AI knows the focus.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const mockResult = `**Project Overview:**
We are looking for an experienced professional to help us execute the requirements detailed in the attached document ("${pdfFile.name}").

**Key Requirements:**
1. Successfully deliver the primary objective: "${form.title}"
2. Ensure a high-quality, scalable, and responsive final product.
3. Adhere strictly to the agreed-upon timeline and project milestones.
4. Provide full source code, documentation, and a staging environment for review.

Please carefully review the attached PDF for the complete scope of work, technical specifications, and deliverables before submitting your proposal. If you have any clarifying questions regarding the requirements, feel free to reach out. We look forward to working with you!`;
      
      setForm(f => ({ ...f, description: mockResult }));
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="page container animate-in">
      <div className="page-header flex justify-between items-center bg-white-theme p-8 rounded-lg shadow-sm mb-8" style={{ padding: '32px 40px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="page-title">{t('dashboard.welcome', { name: user?.first_name || user?.username })}</h1>
          <p className="page-subtitle">{t('dashboard.subtitle')}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowModal(true)} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          <PlusCircle size={18} /> {t('dashboard.post_project')}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid-3 mb-8">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">{projects.length}</div>
              <div className="stat-label">{t('dashboard.total_projects')}</div>
            </div>
            <FileText className="text-teal" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-success">{projects.filter((p) => p.status === 'open').length}</div>
              <div className="stat-label">{t('dashboard.open_hiring')}</div>
            </div>
            <CheckCircle2 className="text-success" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--info)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-info">{projects.filter((p) => p.status === 'in_progress').length}</div>
              <div className="stat-label">{t('dashboard.in_progress')}</div>
            </div>
            <Clock className="text-info" opacity={0.5} size={32} />
          </div>
        </div>
      </div>

      {/* Projects List */}
      <h2 className="mb-4" style={{ fontSize: 24 }}>{t('dashboard.manage_projects')}</h2>
      {loading ? (
        <div className="spinner" />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} className="text-muted mx-auto mb-4" />
          <h3>{t('dashboard.empty_title')}</h3>
          <p className="mb-6">{t('dashboard.empty_subtitle')}</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>{t('dashboard.post_project')}</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.map((p) => (
            <div key={p.id} className="card hover:shadow-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, paddingRight: 24 }}>
                <div className="flex items-center gap-3 mb-2">
                  <Link to={`/projects/${p.id}`} className="hover:text-teal transition-colors" style={{ fontSize: 18, fontWeight: 700 }}>
                    {p.title}
                  </Link>
                  <span className={`badge badge-${statusColors[p.status] || 'teal'}`}>{p.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex gap-4 text-sm text-muted font-medium">
                  <span className="text-primary">₹{Number(p.budget).toLocaleString()} {t('projects.fixed')}</span>
                  <span>{t('projects.ends')} {new Date(p.deadline).toLocaleDateString()}</span>
                  <span>{p.total_bids} {t('projects.proposals')}</span>
                  {p.attached_file && (
                    <a href={`http://127.0.0.1:8001${p.attached_file}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
                      <Download size={14} /> {t('projects.attached')}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Link to={`/projects/${p.id}`} className="btn btn-primary btn-sm">{t('common.view_detail')}</Link>
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
              <h2 style={{ fontSize: 24 }}>{t('dashboard.modal_title')}</h2>
              <button className="btn btn-outline btn-sm" style={{ border: 'none', color: 'var(--text-muted)' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error mb-4">{error}</div>}
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">{t('dashboard.form.title')}</label>
                <input className="form-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder={t('dashboard.form.placeholder_title')} required />
              </div>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label mb-0">{t('dashboard.form.description')}</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: 'var(--accent-teal)', fontWeight: 600 }}>
                      <FileText size={16} /> 
                      {pdfFile ? <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pdfFile.name}</span> : t('dashboard.form.upload_pdf')}
                      <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => setPdfFile(e.target.files[0])} />
                    </label>
                    <button 
                      type="button" 
                      onClick={handleAIGenerate} 
                      disabled={isGenerating || !pdfFile}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 100, cursor: (isGenerating || !pdfFile) ? 'not-allowed' : 'pointer', opacity: (!pdfFile) ? 0.6 : 1 }}
                    >
                      <Wand2 size={16} /> {isGenerating ? t('dashboard.form.generating') : t('dashboard.form.ai_generate')}
                    </button>
                  </div>
                </div>
                <textarea className="form-textarea mt-2" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder={t('dashboard.form.placeholder_desc')} required style={{ minHeight: 120 }} />
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t('dashboard.form.budget')}</label>
                  <input className="form-input" type="number" min={500} value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder={t('dashboard.form.placeholder_budget')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('dashboard.form.deadline')}</label>
                  <input className="form-input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('dashboard.form.skills')}</label>
                <input className="form-input" value={form.required_skills} onChange={(e) => set('required_skills', e.target.value)} placeholder="e.g. React, Django, Graphic Design" />
                <span className="text-xs text-muted mt-1">{t('dashboard.form.skills_help')}</span>
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? t('dashboard.form.posting') : t('dashboard.form.submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

