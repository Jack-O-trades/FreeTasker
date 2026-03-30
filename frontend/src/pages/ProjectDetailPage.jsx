import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProject, getProjectBids, createBid, updateBidStatus, getMyBids } from '../api';
import { useAuth } from '../AuthContext';
import { Clock, Briefcase, CheckCircle, XCircle, MessageSquare, Wand2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bid, setBid] = useState({ amount: '', proposal: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myBid, setMyBid] = useState(null);
  const [bidTier, setBidTier] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getProject(id)
      .then((r) => setProject(r.data))
      .catch(() => {});

    if (user?.role === 'client') {
      getProjectBids(id)
        .then((r) => setBids(r.data.results || r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (user?.role === 'freelancer') {
      getMyBids()
        .then((r) => {
          const data = r.data.results || r.data;
          setMyBid(data.find((b) => String(b.project) === String(id) || String(b.project?.id) === String(id)));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, user]);

  const handleBid = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (Number(bid.amount) < Number(project.budget)) {
      setError(`Bid amount must be at least ₹${Number(project.budget).toLocaleString()} to match the project budget.`);
      setSubmitting(false);
      return;
    }

    try {
      await createBid({ project: id, amount: Number(bid.amount), proposal: bid.proposal });
      setSuccess('Bid submitted successfully!');
      setShowBidForm(false);
      const r = await getMyBids();
      const data = r.data.results || r.data;
      setMyBid(data.find((b) => String(b.project) === String(id) || String(b.project?.id) === String(id)));
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === 'object' ? Object.values(data).flat().join(' ') : 'Failed to submit bid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setBid((b) => ({ 
        ...b, 
        proposal: `Hi there!\n\nI am extremely interested in your project "${project?.title}". With my deep expertise in ${project?.required_skills?.join(', ') || 'this domain'}, I am confident that I can deliver outstanding results within the deadline.\n\nMy ${bidTier} package includes comprehensive delivery and excellent communication.\n\nBest regards,\n${user?.first_name || user?.username}` 
      }));
      setIsGenerating(false);
    }, 1200);
  };

  const handleBidStatus = async (bidId, status) => {
    try {
      await updateBidStatus(bidId, { status });
      setBids((prev) => prev.map((b) => b.id === bidId ? { ...b, status } : b));
    } catch {}
  };

  const statusColors = { open: 'success', in_progress: 'info', completed: 'teal', cancelled: 'danger', closed: 'warning' };
  const bidColors = { pending: 'warning', shortlisted: 'teal', rejected: 'danger', accepted: 'success' };

  if (loading || !project) return <div className="spinner" />;

  return (
    <div className="page container animate-in">
      {/* 2 Column Layout */}
      <div className="flex gap-8 items-start" style={{ flexWrap: 'wrap' }}>
        
        {/* Main Column */}
        <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Project Details */}
          <div className="card" style={{ padding: '40px' }}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-dark-theme" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.3 }}>{project.title}</h1>
            </div>
            
            <div className="flex items-center gap-4 mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className={`badge badge-${statusColors[project.status] || 'teal'}`}>{project.status?.replace('_', ' ')}</span>
              <span className="text-muted text-sm flex items-center gap-1"><Clock size={16} /> {t('projects.ends')} {new Date(project.deadline).toLocaleDateString()}</span>
            </div>

            <p className="text-secondary" style={{ fontSize: 16, lineHeight: 1.8, marginBottom: 32, whiteSpace: 'pre-line' }}>{project.description}</p>
            
            <div className="mb-6">
              <h3 className="text-dark-theme" style={{ fontSize: 18, marginBottom: 16 }}>{t('project_detail.skills_and_expertise')}</h3>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {(project.required_skills || []).map((s) => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
          </div>

          {/* Client: view bids section */}
          {user?.role === 'client' && (
            <div className="card" style={{ padding: '32px' }}>
              <h2 className="text-dark-theme" style={{ fontSize: 24, marginBottom: 24 }}>{t('project_detail.proposals_count', { count: bids.length })}</h2>
              {bids.length === 0 ? (
                <div className="empty-state">
                  <Briefcase size={48} className="icon mx-auto mb-4" />
                  <h3>{t('project_detail.no_proposals')}</h3>
                  <p>{t('project_detail.no_proposals_subtitle')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {[...bids].sort((a, b) => {
                    const statusWeight = { accepted: 1, shortlisted: 2, pending: 3, rejected: 4 };
                    return (statusWeight[a.status] || 5) - (statusWeight[b.status] || 5);
                  }).map((b) => (
                    <div key={b.id} className="card p-6" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-lg">{b.freelancer_email || b.freelancer}</span>
                          <span className={`badge badge-${bidColors[b.status] || 'warning'}`} style={{ width: 'fit-content' }}>
                            {b.status === 'pending' ? t('project_detail.under_review') : b.status}
                          </span>
                        </div>
                        <span className="font-bold text-dark-theme" style={{ fontSize: 24 }}>₹{Number(b.amount).toLocaleString()}</span>
                      </div>
                      {b.proposal && <p className="text-secondary" style={{ fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>"{b.proposal}"</p>}
                      
                      {b.status === 'pending' && (
                        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <button className="btn btn-outline" style={{ borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleBidStatus(b.id, 'shortlisted')}><CheckCircle size={16} /> {t('project_detail.shortlist')}</button>
                          <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleBidStatus(b.id, 'rejected')}><XCircle size={16} /> {t('project_detail.decline')}</button>
                        </div>
                      )}
                      
                      {b.status === 'shortlisted' && (
                        <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <button className="btn btn-primary" onClick={() => handleBidStatus(b.id, 'accepted')}><ShieldCheck size={16} /> {t('project_detail.secure_hire')}</button>
                          <Link to={`/chat`} className="btn btn-outline"><MessageSquare size={16} /> {t('project_detail.message')}</Link>
                        </div>
                      )}
                      <div className="mt-4">
                        <button className="btn btn-sm" style={{ color: 'var(--text-muted)', background: 'transparent', padding: 0 }} onClick={() => alert('Report submitted for review.')}><AlertTriangle size={14} style={{ marginRight: 4 }}/> {t('project_detail.report_user')}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ flex: '1 1 300px', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Budget & Actions Card */}
          <div className="card" style={{ padding: '32px' }}>
            <div className="mb-6">
              <span className="text-muted font-semibold text-sm uppercase tracking-wide">{t('project_detail.project_budget')}</span>
              <div className="text-dark-theme" style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>₹{Number(project.budget).toLocaleString()}</div>
            </div>
            
            <div className="flex items-center gap-3 mb-8 text-sm font-semibold py-4" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div className="text-muted text-xs uppercase mb-1">{t('project_detail.time_left')}</div>
                <div className="text-dark-theme">{project.deadline}</div>
              </div>
              <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div className="text-muted text-xs uppercase mb-1">Proposals</div>
                <div className="text-dark-theme">{t('project_detail.total_submitted', { count: project.total_bids })}</div>
              </div>
            </div>

            {/* Client Info snippet */}
            {project.client && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2 text-dark-theme">{t('project_detail.about_client')}</h4>
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <CheckCircle size={16} className={project.client.is_verified ? "text-success" : "text-muted"} />
                  {project.client.is_verified ? t('project_detail.payment_verified') : t('project_detail.payment_unverified')}
                </div>
              </div>
            )}

            {/* Freelancer actions */}
            {user?.role === 'freelancer' && project.status === 'open' && (
              <div className="mt-4">
                {success && <div className="alert alert-success mb-4">{success}</div>}
                
                {myBid ? (
                  <div className="card p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <h4 className="font-semibold mb-2">{t('project_detail.your_proposal')}</h4>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">₹{Number(myBid.amount).toLocaleString()}</span>
                      <span className={`badge badge-${bidColors[myBid.status] || 'warning'}`}>
                        {myBid.status === 'pending' ? t('project_detail.under_review') : myBid.status}
                      </span>
                    </div>
                    {myBid.proposal && <p className="text-xs text-muted mt-2 truncate">{myBid.proposal.slice(0, 60)}...</p>}
                  </div>
                ) : showBidForm ? (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-3">{t('project_detail.submit_proposal_title')}</h4>
                    {error && <div className="alert alert-error mb-4">{error}</div>}
                    <form onSubmit={handleBid} className="flex flex-col gap-3">
                      <div className="flex justify-between gap-2 mb-2">
                        {['basic', 'standard', 'premium'].map(tier => (
                          <button type="button" key={tier} className={`btn btn-sm ${bidTier === tier ? 'btn-primary' : 'btn-outline'}`} onClick={() => setBidTier(tier)} style={{ flex: 1, textTransform: 'capitalize' }}>{tier}</button>
                        ))}
                      </div>
                      <input className="form-input" type="number" min={project.budget} value={bid.amount} onChange={(e) => setBid((b) => ({ ...b, amount: e.target.value }))} placeholder={t('project_detail.bid_amount_placeholder', { amount: Number(project.budget).toLocaleString() })} required />
                      
                      <div style={{ position: 'relative' }}>
                        <textarea className="form-textarea" value={bid.proposal} onChange={(e) => setBid((b) => ({ ...b, proposal: e.target.value }))} placeholder={t('project_detail.cover_letter_placeholder')} style={{ minHeight: 120, width: '100%' }} required />
                        <button type="button" className="btn btn-secondary btn-sm" style={{ position: 'absolute', bottom: 12, right: 12 }} onClick={handleAIGenerate} disabled={isGenerating}>
                          <Wand2 size={14} /> {isGenerating ? t('project_detail.generating') : t('project_detail.ai_writer')}
                        </button>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>{submitting ? t('project_detail.sending') : t('project_detail.submit_btn')}</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowBidForm(false)}>{t('common.cancel')}</button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowBidForm(true)}>{t('project_detail.submit_btn')}</button>
                )}
              </div>
            )}
            
            {/* If freelancer and project not open */}
            {user?.role === 'freelancer' && project.status !== 'open' && (
              <div className="alert alert-warning text-center mt-4">{t('project_detail.closed_alert')}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

