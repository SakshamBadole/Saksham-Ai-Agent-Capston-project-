import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  DollarSign, 
  FileBarChart2, 
  Settings as SettingsIcon, 
  Users, 
  LogOut, 
  Menu, 
  Sun, 
  Moon, 
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle light/dark mode triggers
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Competitors', path: '/competitors', icon: Users },
    { name: 'Demand Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Pricing Strategy', path: '/pricing', icon: DollarSign },
    { name: 'Reports', path: '/reports', icon: FileBarChart2 },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  return (
    <motion.div 
      className={`h-screen flex flex-col glass-panel border-r border-slate-200/50 dark:border-slate-800/40 relative z-30 transition-all duration-300`}
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Brand logo header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 h-20">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-500/20">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-brand-600 to-emerald-500 bg-clip-text text-transparent dark:from-white dark:to-slate-300 font-sans tracking-wide">
                SmartSeller <span className="text-emerald-500">AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-lg cursor-pointer" onClick={() => setIsCollapsed(false)}>
              <BrainCircuit className="w-5 h-5" />
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 p-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-slate-500 hover:text-brand-500"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group ${
                isActive 
                  ? 'text-brand-600 dark:text-white font-medium bg-brand-500/10 dark:bg-brand-500/20 shadow-sm border-l-4 border-brand-500' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white hover:bg-slate-100/55 dark:hover:bg-slate-900/40'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[14px]"
              >
                {item.name}
              </motion.span>
            )}
            
            {/* Tooltip on collapsed state */}
            {isCollapsed && (
              <div className="absolute left-16 scale-0 rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:scale-100 transition-transform duration-100 origin-left z-50 shadow-md border border-slate-800">
                {item.name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Theme Toggle & User Info */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/40 space-y-2">
        {/* Theme switch bar */}
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100/55 dark:hover:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-brand-500"
        >
          <div className="flex items-center gap-4">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            {!isCollapsed && <span className="text-[14px]">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </div>
        </button>

        {/* User Card logout */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/40 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-800/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
              {user?.email?.charAt(0) || 'S'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">Seller Admin</span>
                <span className="text-[10px] text-slate-500 truncate">{user?.email || 'seller@smartseller.ai'}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={logout}
              className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
