import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBids } from '../api';
import { useAuth } from '../AuthContext';
import { Briefcase, Pickaxe, Award, CheckCircle } from 'lucide-react';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBids()
      .then((r) => setBids(r.data.results || r.data))
      .catch((err) => console.error("Could not fetch bids", err))
      .finally(() => setLoading(false));
  }, []);

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

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        
        {/* Active Bids Section */}
        <div className="card-glass p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl m-0">My Proposals</h2>
            <Link to="/browse" className="text-teal hover:underline text-sm font-semibold">View all projects</Link>
          </div>
          
          {loading ? (
            <div className="spinner my-8 mx-auto" />
          ) : bids.length === 0 ? (
            <div className="text-center py-12 text-muted bg-secondary rounded-md">
              <Pickaxe size={48} className="mx-auto mb-4" opacity={0.3} />
              <p>You haven't submitted any bids yet.</p>
              <Link to="/browse" className="btn btn-primary mt-4 inline-flex">Start Bidding</Link>
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
        </div>

        {/* Reputation & Badges Section */}
        <div className="card-glass p-6 h-fit">
          <h2 className="font-bold text-xl mb-6 m-0">My Reputation</h2>
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-md bg-secondary flex items-center justify-between">
              <span className="font-semibold text-muted">Avg Rating</span>
              <span className="font-bold text-lg flex items-center gap-1">
                ⭐ {profile.avg_rating || 'N/A'} <span className="text-sm font-normal text-muted">({profile.total_ratings || 0})</span>
              </span>
            </div>
            
            <div className="mt-2">
              <h3 className="font-semibold text-sm text-muted mb-3 uppercase tracking-wider">Earned Badges</h3>
              {(profile.badges && profile.badges.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((b) => (
                    <span key={b.id} className="badge" style={{ background: 'var(--accent-teal)', color: '#fff' }} title={b.description}>
                      {b.icon} {b.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted bg-white p-3 rounded border">Complete projects and maintain high ratings to unlock achievement badges.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
