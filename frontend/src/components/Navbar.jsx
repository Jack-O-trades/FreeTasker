import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Search, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="flex items-center gap-6">
        <Link to="/" className="navbar-brand">
          Free<span>Tasker</span>
        </Link>

        {/* Search Bar - hidden on mobile */}
        <div className="hidden-mobile" style={{ marginLeft: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', borderRadius: '100px', border: '1px solid var(--border)', padding: '6px 16px', width: 280 }}>
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="What service are you looking for?" 
              style={{ border: 'none', background: 'transparent', width: '100%', marginLeft: 10, outline: 'none', fontSize: 14 }}
            />
          </div>
        </div>
      </div>

      <div className="navbar-nav hidden-mobile">
        {user ? (
          <>
            {user.role === 'client' && (
              <>
                <Link to="/dashboard" className={`tour-nav-dashboard ${isActive('/dashboard')}`}>Dashboard</Link>
                <Link to="/dashboard?post=1" className={`tour-post-project ${isActive('/dashboard?post=1')}`}>Post a Project</Link>
              </>
            )}
            {user.role === 'freelancer' && (
              <>
                <Link to="/dashboard" className={`tour-nav-dashboard ${isActive('/dashboard')}`}>Dashboard</Link>
                <Link to="/browse" className={`tour-nav-browse ${isActive('/browse')}`}>Find Work</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className={isActive('/admin')}>Admin Panel</Link>
            )}
            <Link to="/chat" className={`tour-nav-chat ${isActive('/chat')}`}>Messages</Link>
          </>
        ) : (
          <>
            <Link to="/browse" className={isActive('/browse')}>Find Work</Link>
            <Link to="/register?role=freelancer" className={isActive('/freelancer')}>Find Talent</Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <>
            <div className="tour-nav-profile" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                {user.first_name || user.username}
              </span>
              <span className="text-xs text-muted" style={{ textTransform: 'capitalize' }}>
                {user.role}
              </span>
            </div>
            
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleLogout}
              style={{ fontWeight: 600, padding: '8px 16px' }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link font-semibold">Sign In</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '100px' }}>Join</Link>
          </>
        )}
      </div>
    </nav>
  );
}
