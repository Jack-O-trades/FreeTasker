import React, { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import { useAuth } from '../AuthContext';
import { useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';

export default function OnboardingTour() {
  const { user } = useAuth();
  const location = useLocation();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);

  // Client Tour Steps
  const clientSteps = [
    {
      target: 'body',
      content: 'Welcome to FreeTasker! I am your assistant bot. Let me show you around the Client features.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-post-project',
      content: 'Click here to post your project. You can define budget, deadlines, and the specific qualifications you need.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav-browse',
      content: 'Search and browse through thousands of talented freelancers across the globe.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav-chat',
      content: 'Message shortlisted freelancers here to interview them before hiring.',
      placement: 'bottom',
    },
  ];

  // Freelancer Tour Steps
  const freelancerSteps = [
    {
      target: 'body',
      content: 'Welcome to FreeTasker! I am your onboarding bot. Ready to skyrocket your freelance career?',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-nav-browse',
      content: 'Browse the latest verified projects here. Check budget ranges and deadlines to find your perfect match.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav-dashboard',
      content: 'Track your Active Bids, generated earnings, and earned Achievement Badges on your dashboard.',
      placement: 'bottom',
    },
    {
      target: '.tour-nav-profile',
      content: 'Upload your portfolio and maintain a high rating to earn the completely new Elite Badges!',
      placement: 'left',
    },
  ];

  useEffect(() => {
    if (!user) return;
    
    // Only run tour once per session for demo purposes, or based on local storage
    const hasSeenTour = localStorage.getItem(`tour_seen_${user.id}`);
    
    if (!hasSeenTour) {
      if (user.role === 'client') setSteps(clientSteps);
      else if (user.role === 'freelancer') setSteps(freelancerSteps);
      
      // Delay to let UI mount
      setTimeout(() => setRun(true), 1500);
    }
  }, [user]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem(`tour_seen_${user?.id}`, 'true');
    }
  };

  const forceStartTour = () => {
    if (user?.role === 'client') setSteps(clientSteps);
    else if (user?.role === 'freelancer') setSteps(freelancerSteps);
    setRun(true);
  };

  if (!user) return null;

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: '#1dbf73',
            zIndex: 10000,
          },
          tooltipContainer: {
            textAlign: 'left',
          },
          buttonNext: {
            borderRadius: 4,
          },
          buttonBack: {
            marginRight: 10,
          }
        }}
        callback={handleJoyrideCallback}
      />
      
      {/* Help Bot Trigger */}
      <button 
        onClick={forceStartTour}
        className="btn btn-primary"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          borderRadius: 50,
          width: 56,
          height: 56,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(29, 191, 115, 0.4)',
          zIndex: 9999
        }}
        title="Help & Tour"
      >
        <Bot size={28} />
      </button>
    </>
  );
}
