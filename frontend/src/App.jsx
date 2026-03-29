import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import BrowsePage from './pages/BrowsePage';
import ClientDashboard from './pages/ClientDashboard';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ChatPage from './pages/ChatPage';
import AdminPanel from './pages/AdminPanel';
import FreelancerDashboard from './pages/FreelancerDashboard';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 100 }} />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

import Footer from './components/Footer';
import OnboardingTour from './components/OnboardingTour';
import FloatingMessageButton from './components/FloatingMessageButton';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <OnboardingTour />
      <FloatingMessageButton />
      <div style={{ flex: 1 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <AuthPage mode="register" />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Dashboards */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['client', 'freelancer']}>
              {user?.role === 'freelancer' ? <FreelancerDashboard /> : <ClientDashboard />}
            </ProtectedRoute>
          } />

          {/* Chat — both roles */}
          <Route path="/chat" element={
            <ProtectedRoute roles={['client', 'freelancer']}>
              <ChatPage />
            </ProtectedRoute>
          } />
          <Route path="/chat/:roomId" element={
            <ProtectedRoute roles={['client', 'freelancer']}>
              <ChatPage />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={
            <div className="page text-center" style={{ padding: '100px 20px' }}>
              <h1 style={{ fontSize: 64, fontWeight: 900, color: 'var(--accent-teal)' }}>404</h1>
              <p className="text-muted">Page not found.</p>
              <a href="/" className="btn btn-primary mt-4">Go Home</a>
            </div>
          } />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
