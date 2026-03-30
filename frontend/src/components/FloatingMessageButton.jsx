import React from 'react';
import { useAuth } from '../AuthContext';
import { MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
  
export default function FloatingMessageButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user || location.pathname.startsWith('/chat')) return null;

  return (
    <button 
      className="btn btn-primary"
      onClick={() => navigate('/chat')}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        borderRadius: 50,
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 8px 16px rgba(29, 191, 115, 0.4)',
        zIndex: 9998,
        fontSize: 15,
        fontWeight: 700
      }}
    >
      <MessageSquare size={20} /> Messages
    </button>
  );
}
