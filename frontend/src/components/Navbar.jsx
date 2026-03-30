import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { useTranslation } from 'react-i18next';
import { Search, Menu, Moon, Sun, Globe } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
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
              placeholder={t('nav.search_placeholder')} 
              style={{ border: 'none', background: 'transparent', width: '100%', marginLeft: 10, outline: 'none', fontSize: 14, color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      <div className="navbar-nav hidden-mobile">
        {user ? (
          <>
            {user.role === 'client' && (
              <>
                <Link to="/dashboard" className={`tour-nav-dashboard ${isActive('/dashboard')}`}>{t('nav.dashboard')}</Link>
                <Link to="/dashboard?post=1" className={`tour-post-project ${isActive('/dashboard?post=1')}`}>{t('nav.post_project')}</Link>
              </>
            )}
            {user.role === 'freelancer' && (
              <>
                <Link to="/dashboard" className={`tour-nav-dashboard ${isActive('/dashboard')}`}>{t('nav.dashboard')}</Link>
                <Link to="/browse" className={`tour-nav-browse ${isActive('/browse')}`}>{t('nav.find_work')}</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className={isActive('/admin')}>{t('nav.admin_panel')}</Link>
            )}
            <Link to="/chat" className={`tour-nav-chat ${isActive('/chat')}`}>{t('nav.messages')}</Link>
          </>
        ) : (
          <>
            <Link to="/browse" className={isActive('/browse')}>{t('nav.find_work')}</Link>
            <Link to="/register?role=freelancer" className={isActive('/freelancer')}>{t('nav.find_talent')}</Link>
          </>
        )}
      </div>

      <div className="navbar-actions">
        {/* Language & Theme Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 8, paddingRight: 16, borderRight: '1px solid var(--border)' }}>
          <button 
            onClick={toggleTheme}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
            <Globe size={18} />
            <select 
              value={i18n.language.split('-')[0]} 
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              style={{ appearance: 'none', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', fontSize: 14, outline: 'none' }}
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="te">TE</option>
            </select>
          </div>
        </div>
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
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link font-semibold">{t('nav.signin')}</Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '100px' }}>{t('nav.join')}</Link>
          </>
        )}
      </div>
    </nav>
  );
}
