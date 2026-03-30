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
    <div style={{ overflowX: 'hidden' }}>
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
          
          <div className="hero-search mb-4">
            <input type="text" placeholder={t('landing.search_placeholder')} />
            <button>{t('landing.search_btn')}</button>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: '#d1d5db' }}>
            <span className="font-semibold">{t('landing.popular')}</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>Website Design</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>WordPress</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>Logo Design</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>AI Services</span>
          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <section style={{ padding: '24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container flex justify-center items-center gap-8 flex-wrap" style={{ opacity: 0.5 }}>
          <span className="font-bold text-lg text-muted">{t('landing.trusted_by')}</span>
          <span className="font-bold" style={{ fontSize: 24, letterSpacing: -1 }}>Google</span>
          <span className="font-bold" style={{ fontSize: 24, letterSpacing: -1 }}>Meta</span>
          <span className="font-bold" style={{ fontSize: 24, letterSpacing: -1 }}>Netflix</span>
          <span className="font-bold" style={{ fontSize: 24, letterSpacing: -1 }}>P&G</span>
          <span className="font-bold" style={{ fontSize: 24, letterSpacing: -1 }}>PayPal</span>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 24px' }}>
        <div className="container">
          <h2 className="mb-8" style={{ fontSize: 32 }}>{t('landing.explore_marketplace')}</h2>
          <div className="grid-4">
            {categories.map((c) => (
              <div key={c.name} className="card text-center hover:shadow-card cursor-pointer" style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 40 }}>{c.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="mb-6" style={{ fontSize: 36 }}>{t('landing.features_title')}</h2>
              
              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2" style={{ fontSize: 20 }}><ShieldCheck className="text-teal" /> {t('landing.feature1_title')}</h3>
                <p className="text-muted">{t('landing.feature1_desc')}</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2" style={{ fontSize: 20 }}><Zap className="text-teal" /> {t('landing.feature2_title')}</h3>
                <p className="text-muted">{t('landing.feature2_desc')}</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2" style={{ fontSize: 20 }}><ShieldCheck className="text-teal" /> {t('landing.feature3_title')}</h3>
                <p className="text-muted">{t('landing.feature3_desc')}</p>
              </div>
            </div>
            <div style={{ padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-float)' }}>
              <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Freelancer working" style={{ borderRadius: 'var(--radius-md)', width: '100%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'var(--accent-teal)', color: 'white' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 48, marginBottom: 24, color: 'white' }}>{t('landing.cta_title')}</h2>
          <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--accent-teal)', padding: '16px 32px', fontSize: 18, borderRadius: 100 }}>{t('landing.cta_btn')}</Link>
        </div>
      </section>
    </div>
  );
}
