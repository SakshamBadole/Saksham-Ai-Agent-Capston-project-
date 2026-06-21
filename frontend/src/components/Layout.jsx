import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();

  // Mapping paths to titles
  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard': return 'Dashboard Overview';
      case '/competitors': return 'Competitor Pricing intelligence';
      case '/forecast': return 'Predictive Demand Forecasting';
      case '/pricing': return 'Strategic Dynamic Pricing';
      case '/reports': return 'Business Intelligence Reports';
      case '/settings': return 'System Settings & API Keys';
      default: return 'SmartSeller AI Portal';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 bg-mesh-light dark:bg-mesh-dark transition-all duration-300">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header Panel */}
        <header className="h-20 border-b border-slate-200/50 dark:border-slate-800/40 px-8 flex items-center justify-between glass-panel shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
              {getPageTitle(location.pathname)}
            </h1>
            <span className="text-xs text-slate-500 font-medium">
              Autonomous AI Agent Commerce Intelligence
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="p-2 rounded-lg text-slate-500 hover:text-brand-500 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </button>
            
            {/* Quick user badge */}
            <div className="hidden sm:flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {user?.email || 'admin@smartseller.ai'}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                Active Session
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
