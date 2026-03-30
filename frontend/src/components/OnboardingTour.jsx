import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HelpCircle, Play, Mail, X } from 'lucide-react';

export default function OnboardingTour() {
  const { user } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      setRun(false);
      return;
    }

    const allSteps = user.role === 'client' ? [
      { target: 'body', content: t('tour.client_step1'), placement: 'center' },
      { target: '.tour-post-project', content: t('tour.client_step2'), placement: 'bottom' },
      { target: '.tour-nav-dashboard', content: t('tour.client_step3'), placement: 'bottom' },
      { target: '.tour-nav-chat', content: t('tour.client_step4'), placement: 'bottom' }
    ] : [
      { target: 'body', content: t('tour.freelancer_step1'), placement: 'center' },
      { target: '.tour-nav-dashboard', content: t('tour.freelancer_step2'), placement: 'bottom' },
      { target: '.tour-nav-browse', content: t('tour.freelancer_step3'), placement: 'bottom' },
      { target: '.tour-nav-chat', content: t('tour.freelancer_step4'), placement: 'bottom' }
    ];

    // Filter to ensure target is either 'body' or exists in the current DOM
    const validSteps = allSteps.filter(s => s.target === 'body' || document.querySelector(s.target));
    setSteps(validSteps);

    const hasSeenTour = localStorage.getItem(`tour_seen_${user.id}`);
    if (!hasSeenTour && location.pathname === '/dashboard') {
      localStorage.setItem(`tour_seen_${user.id}`, 'true');
      const timer = setTimeout(() => setRun(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user, location.pathname, t, i18n.language]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
    }
  };

  const startTourManually = () => {
    setShowHelpMenu(false);
    setRun(true);
  };

  if (!user) return null;

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#1dbf73',
            backgroundColor: 'var(--bg-card)',
            textColor: 'var(--text-primary)',
            arrowColor: 'var(--bg-card)',
            zIndex: 10000,
          },
        }}
      />
      
      <div style={{ position: 'fixed', bottom: 24, right: 165, zIndex: 9999 }}>
        {showHelpMenu && (
          <div style={{
            position: 'absolute',
            bottom: '60px',
            right: 0,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-float)',
            padding: '16px',
            width: '240px',
            border: '1px solid var(--border)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 16 }}>Help Center</h4>
              <button 
                onClick={() => setShowHelpMenu(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <button 
              onClick={startTourManually}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 8, textAlign: 'left', marginBottom: 8, cursor: 'pointer' }}
            >
              <Play size={16} color="#1dbf73" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Want to know about our website</span>
            </button>
            
            <button 
              onClick={() => { setShowHelpMenu(false); alert("Please contact support at support@freetasker.com"); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 8, textAlign: 'left', cursor: 'pointer' }}
            >
              <Mail size={16} color="#4f46e5" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Contact for help</span>
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowHelpMenu(!showHelpMenu)}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 30,
            padding: '12px 20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14
          }}
        >
          <HelpCircle size={18} color="#1dbf73" /> Help
        </button>
      </div>
    </>
  );
}
