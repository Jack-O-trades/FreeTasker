import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Zap, Star, LayoutDashboard, Users, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const categories = [
    { icon: '💻', name: 'Programming & Tech' },
    { icon: '🎨', name: 'Graphics & Design' },
    { icon: '✍️', name: 'Writing & Translation' },
    { icon: '📈', name: 'Digital Marketing' },
    { icon: '🎬', name: 'Video & Animation' },
    { icon: '🎵', name: 'Music & Audio' },
    { icon: '💼', name: 'Business' },
    { icon: '📊', name: 'Data' },
  ];

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content animate-in">
          <h1 className="hero-title">
            Find the perfect <i>freelance</i> services for your business
          </h1>
          <p className="hero-subtitle">
            Millions of people use FreeTasker to turn their ideas into reality. Discover top talent safely and securely.
          </p>
          
          <div className="hero-search mb-4">
            <input type="text" placeholder="Try 'building a React application'" />
            <button>Search</button>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap text-sm" style={{ color: '#d1d5db' }}>
            <span className="font-semibold">Popular:</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>Website Design</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>WordPress</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>Logo Design</span>
            <span className="tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>AI Services</span>
          </div>
        </div>
      </section>

      {/* Trusted By Banner */}
      <section style={{ padding: '24px', background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
        <div className="container flex justify-center items-center gap-8 flex-wrap" style={{ opacity: 0.5 }}>
          <span className="font-bold text-lg text-muted">Trusted by:</span>
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
          <h2 className="mb-8" style={{ fontSize: 32 }}>Explore the marketplace</h2>
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
      <section style={{ padding: '80px 24px', background: '#f0fdf4' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 className="mb-6" style={{ fontSize: 36 }}>A whole world of freelance talent at your fingertips</h2>
              
              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2" style={{ fontSize: 20 }}><ShieldCheck className="text-teal" /> The best for every budget</h3>
                <p className="text-muted">Find high-quality services at every price point. No hourly rates, just project-based pricing.</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2" style={{ fontSize: 20 }}><Zap className="text-teal" /> Quality work done quickly</h3>
                <p className="text-muted">Find the right freelancer to begin working on your project within minutes.</p>
              </div>

              <div className="mb-6">
                <h3 className="flex items-center gap-2 mb-2" style={{ fontSize: 20 }}><ShieldCheck className="text-teal" /> Protected payments, every time</h3>
                <p className="text-muted">Always know what you'll pay upfront. Your payment isn't released until you approve the work.</p>
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
          <h2 style={{ fontSize: 48, marginBottom: 24, color: 'white' }}>Find the talent needed to get your business growing.</h2>
          <Link to="/register" className="btn" style={{ background: 'white', color: 'var(--accent-teal)', padding: '16px 32px', fontSize: 18, borderRadius: 100 }}>Get Started</Link>
        </div>
      </section>
    </div>
  );
}
