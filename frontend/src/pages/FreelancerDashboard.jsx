import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyBids, getRecommendedProjects, updateProfile } from '../api';
import { useAuth } from '../AuthContext';
import { Briefcase, Pickaxe, Award, CheckCircle, Edit3, Save } from 'lucide-react';

export default function FreelancerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSkills, setEditingSkills] = useState(false);
  const [skillsStr, setSkillsStr] = useState('');

  useEffect(() => {
    Promise.all([getMyBids(), getRecommendedProjects()])
      .then(([bidsRes, recRes]) => {
        setBids(bidsRes.data.results || bidsRes.data);
        setRecommended(recRes.data.results || recRes.data);
      })
      .catch((err) => console.error("Could not fetch dashboard data", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.profile?.skills) {
      setSkillsStr(user.profile.skills.join(', '));
    }
  }, [user]);

  const handleSaveSkills = async () => {
    try {
      const skillsArray = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      await updateProfile({ skills: skillsArray });
      setEditingSkills(false);
      user.profile.skills = skillsArray;
    } catch (err) {
      console.error("Failed to update skills:", err);
    }
  };

  const profile = user?.profile || {};
  const activeBidsCount = bids.length;
  const wonBidsCount = bids.filter(b => b.status === 'shortlisted' || b.status === 'accepted').length;

  return (
    <div className="page container animate-in">
      <div className="page-header flex justify-between items-center bg-white-theme p-8 rounded-lg shadow-sm mb-8" style={{ padding: '32px 40px', border: '1px solid var(--border)' }}>
        <div>
          <h1 className="page-title">{t('dashboard.welcome', { name: user?.first_name || user?.username })}</h1>
          <p className="page-subtitle">{t('freelancer_dashboard.subtitle')}</p>
        </div>
        <Link to="/browse" className="btn btn-primary btn-lg">
          <Briefcase size={18} /> {t('freelancer_dashboard.find_projects')}
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid-3 mb-8">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">{activeBidsCount}</div>
              <div className="stat-label">{t('freelancer_dashboard.total_bids')}</div>
            </div>
            <Pickaxe className="text-teal" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-success">{wonBidsCount}</div>
              <div className="stat-label">{t('freelancer_dashboard.bids_shortlisted')}</div>
            </div>
            <CheckCircle className="text-success" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value text-warning">{profile.completed_projects || 0}</div>
              <div className="stat-label">{t('freelancer_dashboard.projects_completed')}</div>
            </div>
            <Award className="text-warning" opacity={0.5} size={32} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        
        {/* Active Bids Section */}
        <div style={{ flex: '2 1 400px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
            <h2 className="font-bold text-xl m-0">{t('freelancer_dashboard.my_proposals')}</h2>
            <Link to="/browse" className="text-teal hover:underline text-sm font-semibold">{t('freelancer_dashboard.view_all_projects')}</Link>
          </div>
          
          {loading ? (
            <div className="spinner" />
          ) : bids.length === 0 ? (
            <div className="empty-state">
              <Pickaxe size={48} className="icon mx-auto mb-4" />
              <p>{t('freelancer_dashboard.no_bids_text')}</p>
              
              <div className="tour-demo-project" style={{ marginTop: 32, textAlign: 'left', background: 'var(--bg-secondary)', padding: 24, borderRadius: 8, border: '2px solid var(--accent-teal)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ background: 'var(--accent-teal-dim)', color: 'var(--accent-teal)', padding: '4px 10px', fontSize: 12, borderRadius: 100, fontWeight: 700 }}>AI ONBOARDING DEMO</span>
                  <span style={{ fontWeight: 600 }}>Budget: ₹15,000</span>
                </div>
                <h4 style={{ fontSize: 18, margin: '12px 0 8px 0' }}>Build a React Native E-Commerce App</h4>
                <p className="text-sm text-secondary" style={{ margin: '8px 0', lineHeight: 1.5 }}>
                  We are looking for a skilled frontend developer to create a stunning mobile app over the next 2 weeks. Must be highly responsive and include Stripe integration.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button 
                    className="btn btn-primary tour-demo-bid-btn" 
                    onClick={() => alert("🎉 Welcome to the Bidding Simulator!\n\nIn a real project, this button opens our Proposal Modal where you can select your Bid Tier (Basic/Current), define your timeline, and even click the 'AI Writer Wand' to let our bot draft your cover letter automatically! Check out live projects in the 'Find Work' tab to try it out for real.")}
                  >
                    {t('freelancer_dashboard.practice_bid_btn')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bids.map((bid) => (
                <div key={bid.id} className="card p-4 flex justify-between items-center">
                  <div>
                    <Link to={`/projects/${bid.project.id}`} className="font-bold text-lg hover:text-teal mb-1 block">
                      {bid.project.title}
                    </Link>
                    <div className="flex gap-4 text-sm text-muted">
                      <span>{t('dashboard.form.budget')}: <strong>₹{Number(bid.amount).toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>{t('dashboard.form.deadline')}: {bid.delivery_time_days} {t('projects.days')}</span>
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${bid.status === 'shortlisted' ? 'badge-success' : bid.status === 'rejected' ? 'badge-danger' : 'badge-info'}`}>
                      {bid.status === 'pending' ? t('reputation.under_review') : bid.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Recommended Projects Section */}
          <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
              <h2 className="font-bold text-xl m-0">{t('freelancer_dashboard.recommended_for_you')}</h2>
              <Link to="/browse" className="text-teal hover:underline text-sm font-semibold">{t('freelancer_dashboard.browse_all')}</Link>
            </div>
            
            {loading ? (
               <div className="spinner" />
            ) : recommended.length === 0 ? (
               <div className="empty-state py-8" style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px dashed var(--border)' }}>
                 <p className="mb-4">{t('freelancer_dashboard.update_skills_prompt')}</p>
                 <button className="btn btn-outline btn-sm" onClick={() => {
                   setEditingSkills(true);
                   document.querySelector('textarea')?.focus();
                 }}>
                   <Edit3 size={14} /> {t('common.edit')} {t('freelancer_dashboard.my_skills')}
                 </button>
               </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recommended.slice(0, 5).map((proj) => (
                  <div key={proj.id} className="card p-4">
                    <Link to={`/projects/${proj.id}`} className="font-bold text-lg hover:text-teal mb-1 block">
                      {proj.title}
                    </Link>
                    <p className="text-sm text-secondary" style={{ marginBottom: 12 }}>
                      {(proj.description || '').length > 100 ? proj.description.substring(0, 100) + '...' : (proj.description || '')}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-muted">
                      <span className="text-primary">{t('dashboard.form.budget')}: ₹{Number(proj.budget).toLocaleString()}</span>
                      <span>•</span>
                      <span>{t('dashboard.form.skills')}: {proj.required_skills?.join(', ') || t('projects.no_skills')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reputation & Badges Section */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Skills Section */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
              <h2 className="font-bold text-xl m-0">{t('freelancer_dashboard.my_skills')}</h2>
              {!editingSkills ? (
                 <button className="btn btn-outline btn-sm" onClick={() => setEditingSkills(true)}><Edit3 size={14} /></button>
              ) : (
                 <button className="btn btn-primary btn-sm" onClick={handleSaveSkills}><Save size={14} /></button>
              )}
            </div>
            {editingSkills ? (
              <textarea 
                className="form-input" 
                value={skillsStr} 
                onChange={(e) => setSkillsStr(e.target.value)} 
                placeholder={t('freelancer_dashboard.placeholder_skills')} 
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? profile.skills.map((s, idx) => (
                  <span key={idx} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{s}</span>
                )) : <span className="text-muted text-sm">{t('freelancer_dashboard.no_skills_text')}</span>}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
            <h2 className="font-bold text-xl m-0" style={{ marginBottom: 24 }}>{t('reputation.title')}</h2>
          <div className="flex flex-col gap-4">
            <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-semibold text-muted">{t('reputation.avg_rating')}</span>
              <span className="font-bold" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 4 }}>
                ⭐ {profile.avg_rating || t('reputation.na')} <span style={{ fontSize: 14, fontWeight: 'normal', color: 'var(--text-muted)' }}>({profile.total_ratings || 0})</span>
              </span>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('reputation.earned_badges')}</h3>
              {(profile.badges && profile.badges.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((b) => (
                    <span key={b.id} className="badge" style={{ background: 'var(--accent-teal)', color: '#fff' }} title={b.description}>
                      {b.icon} {b.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted bg-white-theme p-4 rounded-md border border-theme">{t('reputation.badges_empty_text')}</p>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

