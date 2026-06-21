import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginRegister from './pages/LoginRegister';
import Dashboard from './pages/Dashboard';
import CompetitorAnalysis from './pages/CompetitorAnalysis';
import DemandForecast from './pages/DemandForecast';
import PricingStrategy from './pages/PricingStrategy';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

// Protected Route Wrapper Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 font-sans text-xs">
        Validating secure session context...
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public SaaS marketing routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginRegister />} />

          {/* Secure Admin Portal Routes wrapped in Auth guards & Layout wrappers */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/competitors" 
            element={
              <ProtectedRoute>
                <CompetitorAnalysis />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forecast" 
            element={
              <ProtectedRoute>
                <DemandForecast />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pricing" 
            element={
              <ProtectedRoute>
                <PricingStrategy />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
