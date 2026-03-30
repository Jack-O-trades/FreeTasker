import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';
import { HelpCircle, Play, Mail, X } from 'lucide-react';

export default function OnboardingTour() {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);
  const [showHelpMenu, setShowHelpMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      setRun(false);
      return;
    }

    let isDashboard = location.pathname.includes('/dashboard');

    if (user.role === 'client') {
      setSteps([
        { target: 'body', content: 'Welcome to FreeTasker! Let us show you around your Client tools.', placement: 'center' },
        { target: '.tour-post-project', content: 'Click here to instantly post a new project to our freelancer network.', placement: 'bottom' },
        { target: '.tour-nav-dashboard', content: 'Your primary hub! Track all your open, active, and completed projects here.', placement: 'bottom' },
        { target: '.tour-nav-chat', content: 'All your freelancer interactions and active chats will appear here.', placement: 'bottom' }
      ]);
    } else if (user.role === 'freelancer') {
      setSteps([
        { target: 'body', content: 'Welcome to FreeTasker! Here is how to succeed as a freelancer.', placement: 'center' },
        { target: '.tour-nav-dashboard', content: 'Your primary hub! Track your earnings and badges here.', placement: 'bottom' },
        { target: '.tour-nav-browse', content: 'Use the Find Work tab to manually search for open projects and submit proposals.', placement: 'bottom' },
        { target: '.tour-nav-chat', content: 'Communicate with clients safely through our real-time messaging.', placement: 'bottom' }
      ]);
    }

    const hasSeenTour = localStorage.getItem(`tour_seen_${user.id}`);
    if (!hasSeenTour) {
      localStorage.setItem(`tour_seen_${user.id}`, 'true');
      setTimeout(() => setRun(true), 1200);
    }
  }, [user, location.pathname]);

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
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '16px',
            width: '240px',
            border: '1px solid #e5e7eb',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 16 }}>Help Center</h4>
              <button 
                onClick={() => setShowHelpMenu(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <button 
              onClick={startTourManually}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, textAlign: 'left', marginBottom: 8, color: '#111827', cursor: 'pointer' }}
            >
              <Play size={16} color="#1dbf73" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Want to know about our website</span>
            </button>
            
            <button 
              onClick={() => { setShowHelpMenu(false); alert("Please contact support at support@freetasker.com"); }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, textAlign: 'left', color: '#111827', cursor: 'pointer' }}
            >
              <Mail size={16} color="#4f46e5" />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Contact for help</span>
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowHelpMenu(!showHelpMenu)}
          style={{
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
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
