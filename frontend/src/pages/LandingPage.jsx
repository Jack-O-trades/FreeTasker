import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Search, ShieldCheck, Zap, Star, LayoutDashboard, Users, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();
  
  const categories = [
    { icon: '💻', name: t('landing.categories.tech') },
    { icon: '🎨', name: t('landing.categories.design') },
    { icon: '✍️', name: t('landing.categories.writing') },
    { icon: '📈', name: t('landing.categories.marketing') },
    { icon: '🎬', name: t('landing.categories.video') },
    { icon: '🎵', name: t('landing.categories.music') },
    { icon: '💼', name: t('landing.categories.business') },
    { icon: '📊', name: t('landing.categories.data') },
  ];

  return (
    <div style={{ overflowX: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-in">
          <h1 className="hero-title">
            <Trans i18nKey="landing.hero_title">
              Find the perfect <i>freelance</i> services for your business
            </Trans>
          </h1>
          <p className="hero-subtitle">
            {t('landing.hero_subtitle')}
          </p>
          
          <div className="hero-search">
            <input 
              type="text" 
              placeholder={t('landing.search_placeholder')} 
              style={{ color: 'var(--text-primary)', background: 'transparent' }}
            />
            <button className="btn-primary">{t('landing.search_btn')}</button>
          </div>
          
          <div className="hero-tags">
            <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{t('landing.popular')}</span>
            <span className="tag">Website Design</span>
            <span className="tag">WordPress</span>
            <span className="tag">Logo Design</span>
            <span className="tag">AI Services</span>
          </div>
        </div>
      </section>


      {/* Categories */}
      <section style={{ padding: '60px 24px' }} className="page">
        <div style={{ marginBottom: 32 }}>
          <h2 className="text-dark-theme" style={{ fontSize: 32 }}>{t('landing.explore_marketplace')}</h2>
        </div>
        <div className="grid-4">
          {categories.map((c) => (
            <div key={c.name} className="card text-center hover:shadow-card cursor-pointer" style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 40 }}>{c.icon}</div>
              <h3 className="text-dark-theme" style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '60px 24px', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 48 }}>
            <div>
              <h2 className="mb-6 text-dark-theme" style={{ fontSize: 36 }}>{t('landing.features_title')}</h2>
              
              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2 text-dark-theme" style={{ fontSize: 20 }}><ShieldCheck className="text-teal" /> {t('landing.feature1_title')}</h3>
                <p className="text-muted">{t('landing.feature1_desc')}</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2 text-dark-theme" style={{ fontSize: 20 }}><Zap className="text-teal" /> {t('landing.feature2_title')}</h3>
                <p className="text-muted">{t('landing.feature2_desc')}</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2 text-dark-theme" style={{ fontSize: 20 }}><ShieldCheck className="text-teal" /> {t('landing.feature3_title')}</h3>
                <p className="text-muted">{t('landing.feature3_desc')}</p>
              </div>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)', border: '1px solid var(--border)' }}>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Professional team" 
                style={{ borderRadius: 'var(--radius-md)', width: '100%', display: 'block' }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'var(--accent-teal)', color: 'white' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 48, marginBottom: 24, color: 'white' }}>{t('landing.cta_title')}</h2>
          <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--accent-teal)', padding: '16px 32px', fontSize: 18, borderRadius: 100, fontWeight: 700 }}>{t('landing.cta_btn')}</Link>
        </div>
      </section>
    </div>
  );
}

