import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e5e7eb', padding: '60px 24px 24px', marginTop: '60px' }}>
      <div className="container">
        <div className="grid-4 mb-8">
          <div>
            <div className="mb-4">
              <span className="font-bold" style={{ fontSize: 24, letterSpacing: '-0.5px' }}>
                Free<span style={{ color: 'var(--accent-teal)' }}>Tasker</span>
              </span>
            </div>
            <p className="text-muted text-sm pr-4">
              The world's leading professional freelancing platform. Connect, collaborate, and get work done securely.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-primary font-semibold">For Clients</h4>
            <div className="flex flex-col gap-2">
              <Link to="/how-to-hire" className="text-muted text-sm hover:text-teal">How to Hire</Link>
              <Link to="/projects/create" className="text-muted text-sm hover:text-teal">Post a Project</Link>
              <Link to="/enterprise" className="text-muted text-sm hover:text-teal">Enterprise</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-primary font-semibold">For Freelancers</h4>
            <div className="flex flex-col gap-2">
              <Link to="/how-to-find-work" className="text-muted text-sm hover:text-teal">How to Find Work</Link>
              <Link to="/browse" className="text-muted text-sm hover:text-teal">Browse Jobs</Link>
              <Link to="/freelancer-success" className="text-muted text-sm hover:text-teal">Success Stories</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-4 text-primary font-semibold">Resources</h4>
            <div className="flex flex-col gap-2">
              <Link to="/help" className="text-muted text-sm hover:text-teal">Help & Support</Link>
              <Link to="/trust" className="text-muted text-sm hover:text-teal">Trust & Safety</Link>
              <Link to="/blog" className="text-muted text-sm hover:text-teal">Blog</Link>
            </div>
          </div>
        </div>
        
        <div className="divider"></div>
        
        <div className="flex justify-between items-center flex-wrap gap-4">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} FreeTasker Global Inc.
          </p>
          <div className="flex gap-4">
            <span className="text-sm text-muted hover:text-primary cursor-pointer">Terms of Service</span>
            <span className="text-sm text-muted hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="text-sm text-muted hover:text-primary cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
