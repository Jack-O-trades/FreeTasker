import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids, getRecommendedProjects, updateProfile } from '../api';
import { useAuth } from '../AuthContext';
import { Briefcase, Pickaxe, Award, CheckCircle, Edit3, Save } from 'lucide-react';

export default function FreelancerDashboard() {
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
      <div className="page-header flex justify-between items-center bg-white p-8 rounded-lg shadow-sm mb-8" style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', padding: '32px 40px', border: '1px solid var(--border)' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 28 }}>Welcome back, {user?.first_name || user?.username}</h1>
          <p className="page-subtitle">Here is your freelance activity overview.</p>
        </div>
        <Link to="/browse" className="btn btn-primary btn-lg">
          <Briefcase size={18} /> Find Projects
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid-4 mb-8">
        <div className="stat-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">{activeBidsCount}</div>
              <div className="stat-label">Total Bids</div>
            </div>
            <Pickaxe className="text-teal" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">{wonBidsCount}</div>
              <div className="stat-label">Bids Shortlisted</div>
            </div>
            <CheckCircle className="text-success" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">{profile.completed_projects || 0}</div>
              <div className="stat-label">Projects Completed</div>
            </div>
            <Award className="text-warning" opacity={0.5} size={32} />
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="flex justify-between items-start">
            <div>
              <div className="stat-value">₹{profile.hourly_rate || 0}/hr</div>
              <div className="stat-label">Current Rate</div>
            </div>
            <span className="text-indigo" style={{ fontSize: 32, opacity: 0.5 }}>₹</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
        
        {/* Active Bids Section */}
        <div style={{ flex: '2 1 400px', background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
            <h2 className="font-bold text-xl m-0">My Proposals</h2>
            <Link to="/browse" className="text-teal hover:underline text-sm font-semibold">View all projects</Link>
          </div>
          
          {loading ? (
            <div className="spinner my-8 mx-auto" />
          ) : bids.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed #d1d5db' }}>
              <Pickaxe size={48} className="mx-auto mb-4" opacity={0.3} color="#9ca3af" />
              <p style={{ color: 'var(--text-muted)' }}>You haven't submitted any actual bids yet.</p>
              
              <div className="tour-demo-project" style={{ marginTop: 32, textAlign: 'left', background: 'white', padding: 24, borderRadius: 8, border: '2px solid var(--accent-teal)', boxShadow: '0 4px 12px rgba(29,191,115,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', fontSize: 12, borderRadius: 100, fontWeight: 700 }}>AI ONBOARDING DEMO</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Budget: ₹15,000</span>
                </div>
                <h4 style={{ fontSize: 18, color: '#111827', margin: '0 0 8px 0' }}>Build a React Native E-Commerce App</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '8px 0', lineHeight: 1.5 }}>
                  We are looking for a skilled frontend developer to create a stunning mobile app over the next 2 weeks. Must be highly responsive and include Stripe integration.
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button 
                    className="btn btn-primary tour-demo-bid-btn" 
                    onClick={() => alert("🎉 Welcome to the Bidding Simulator!\n\nIn a real project, this button opens our Proposal Modal where you can select your Bid Tier (Basic/Current), define your timeline, and even click the 'AI Writer Wand' to let our bot draft your cover letter automatically! Check out live projects in the 'Find Work' tab to try it out for real.")}
                  >
                    Submit Practice Bid
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bids.map((bid) => (
                <div key={bid.id} className="p-4 rounded-md flex justify-between items-center" style={{ border: '1px solid var(--border)', background: '#fff' }}>
                  <div>
                    <Link to={`/projects/${bid.project.id}`} className="font-bold text-lg hover:text-teal mb-1 block">
                      {bid.project.title}
                    </Link>
                    <div className="flex gap-4 text-sm text-muted">
                      <span>Bid Amount: <strong>₹{Number(bid.amount).toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Delivery: {bid.delivery_time_days} days</span>
                    </div>
                  </div>
                  <div>
                    <span className={`badge ${bid.status === 'shortlisted' ? 'badge-success' : bid.status === 'rejected' ? 'badge-danger' : 'badge-info'}`}>
                      {bid.status === 'pending' ? 'Under Review' : bid.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Recommended Projects Section */}
          <div style={{ marginTop: 40, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
              <h2 className="font-bold text-xl m-0">Recommended for You</h2>
              <Link to="/browse" className="text-teal hover:underline text-sm font-semibold">Browse all</Link>
            </div>
            
            {loading ? (
               <div className="spinner my-8 mx-auto" />
            ) : recommended.length === 0 ? (
               <p className="text-muted text-center py-4" style={{ background: 'var(--bg-secondary)', borderRadius: 8 }}>Update your skills to see personalized project recommendations.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {recommended.slice(0, 5).map((proj) => (
                  <div key={proj.id} className="p-4 rounded-md" style={{ border: '1px solid var(--border)', background: '#fff' }}>
                    <Link to={`/projects/${proj.id}`} className="font-bold text-lg hover:text-teal mb-1 block">
                      {proj.title}
                    </Link>
                    <p className="text-sm text-secondary" style={{ marginBottom: 12 }}>
                      {(proj.description || '').length > 100 ? proj.description.substring(0, 100) + '...' : (proj.description || '')}
                    </p>
                    <div className="flex gap-4 text-xs font-semibold text-muted">
                      <span style={{ color: 'var(--text-primary)' }}>Budget: ₹{Number(proj.budget).toLocaleString()}</span>
                      <span>•</span>
                      <span>Requires: {proj.required_skills?.join(', ') || 'No specific skills listed'}</span>
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
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px', height: 'fit-content' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
              <h2 className="font-bold text-xl m-0">My Skills</h2>
              {!editingSkills ? (
                 <button className="btn btn-outline btn-sm" onClick={() => setEditingSkills(true)} style={{ padding: '6px 10px' }}><Edit3 size={14} /></button>
              ) : (
                 <button className="btn btn-primary btn-sm" onClick={handleSaveSkills} style={{ padding: '6px 10px' }}><Save size={14} /></button>
              )}
            </div>
            {editingSkills ? (
              <textarea 
                className="form-input" 
                value={skillsStr} 
                onChange={(e) => setSkillsStr(e.target.value)} 
                placeholder="React, Design, Python" 
                style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.length > 0 ? profile.skills.map((s, idx) => (
                  <span key={idx} className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{s}</span>
                )) : <span className="text-muted text-sm">No skills added. Click edit to add your expertise.</span>}
              </div>
            )}
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '32px', height: 'fit-content' }}>
            <h2 className="font-bold text-xl m-0" style={{ marginBottom: 24 }}>My Reputation</h2>
          <div className="flex flex-col gap-4">
            <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="font-semibold text-muted">Avg Rating</span>
              <span className="font-bold" style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 4 }}>
                ⭐ {profile.avg_rating || 'N/A'} <span style={{ fontSize: 14, fontWeight: 'normal', color: 'var(--text-muted)' }}>({profile.total_ratings || 0})</span>
              </span>
            </div>
            
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Earned Badges</h3>
              {(profile.badges && profile.badges.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((b) => (
                    <span key={b.id} className="badge" style={{ background: 'var(--accent-teal)', color: '#fff' }} title={b.description}>
                      {b.icon} {b.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 14, color: 'var(--text-muted)', background: '#ffffff', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>Complete projects and maintain high ratings to unlock achievement badges.</p>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
