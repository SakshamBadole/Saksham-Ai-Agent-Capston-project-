import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Save, 
  Key, 
  Percent, 
  User, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight,
  Info,
  CheckCircle
} from 'lucide-react';

const Settings = () => {
  // System Target Margin state
  const [targetMargin, setTargetMargin] = useState(() => {
    const stored = localStorage.getItem('target_margin');
    return stored ? (parseFloat(stored) * 100).toString() : '20';
  });

  // Toggles state
  const [autoApply, setAutoApply] = useState(() => {
    const stored = localStorage.getItem('auto_apply_pricing');
    return stored === 'true';
  });

  const [agentActive, setAgentActive] = useState(true);
  const [geminiKeyStatus, setGeminiKeyStatus] = useState('CONFIGURED'); // Simulated status from backend checks
  const [profileEmail, setProfileEmail] = useState('demo@smartseller.ai');
  const [profilePassword, setProfilePassword] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Save target margin (convert from e.g. 20% to 0.20)
    const marginRatio = parseFloat(targetMargin) / 100;
    localStorage.setItem('target_margin', marginRatio.toString());
    localStorage.setItem('auto_apply_pricing', autoApply.toString());

    setSaveMessage('System configurations updated successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Dynamic Margin & Automation Settings */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
            <Percent className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI Agent Margin & Strategy Controls</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-semibold text-slate-500">
            {/* Target margin input */}
            <div className="space-y-2">
              <label className="text-slate-400 uppercase tracking-wide text-[9px] flex items-center gap-1.5">
                Target Profit Margin ROI (%)
              </label>
              <div className="relative max-w-xs">
                <input
                  type="number"
                  required
                  min="5"
                  max="80"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-bold"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 font-semibold text-xs">%</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Minimum profit margins used by the Pricing Specialist Agent to calculate prices. The agent will never recommend prices below cost + this margin constraint.
              </p>
            </div>

            {/* Strategy Toggles */}
            <div className="space-y-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/30">
              {/* Toggle 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-700 dark:text-slate-350 block">Auto-Apply Pricing Recommendations</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block max-w-sm">
                    Allow the Dynamic Pricing Agent to automatically push optimized price adjustments directly to the live catalog without requiring manual reviews.
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setAutoApply(!autoApply)}
                  className="text-slate-400 dark:text-slate-600 focus:outline-none shrink-0"
                >
                  {autoApply ? <ToggleRight className="w-12 h-12 text-emerald-500" /> : <ToggleLeft className="w-12 h-12" />}
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/20 dark:border-slate-800/20">
                <div>
                  <span className="text-slate-700 dark:text-slate-350 block">Continuous Market Scraping Scanner</span>
                  <span className="text-[10px] text-slate-500 font-medium mt-1 block max-w-sm">
                    Enable background execution of the Competitor Scraping Agent. If deactivated, competitor listings are only scanned when manually triggered.
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setAgentActive(!agentActive)}
                  className="text-slate-400 dark:text-slate-600 focus:outline-none shrink-0"
                >
                  {agentActive ? <ToggleRight className="w-12 h-12 text-brand-500" /> : <ToggleLeft className="w-12 h-12" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/30 flex items-center justify-between">
              {saveMessage && (
                <span className="text-emerald-500 flex items-center gap-1.5 text-[11px]">
                  <CheckCircle className="w-4 h-4" /> {saveMessage}
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/10 flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" /> Save Strategy Configuration
              </button>
            </div>
          </form>
        </div>

        {/* User Account Settings */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
            <User className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Seller Profile Settings</h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Profile updated!'); }} className="space-y-4 text-xs font-semibold text-slate-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-wide text-[9px]">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 uppercase tracking-wide text-[9px]">New Password</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={profilePassword}
                  onChange={(e) => setProfilePassword(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-3 px-5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-450 font-bold rounded-xl transition-all"
            >
              Update Security Credentials
            </button>
          </form>
        </div>
      </div>

      {/* Developer API settings */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">API Key Provisioning</h3>
          </div>

          <div className="space-y-4 text-xs">
            <p className="text-slate-500 font-medium leading-relaxed">
              SmartSeller AI uses the **Google Gemini API** to fuel the multi-agent consensus workflow (reasoning logic, competitor comparisons, and compiler tasks).
            </p>

            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-850 bg-slate-100/30 dark:bg-slate-900/30 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Gemini Integration Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-slate-700 dark:text-slate-200">Secure Backend Configured</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed pt-1.5">
                The Gemini model configuration is being handled securely by the backend via the `.env` settings. The dynamic agent is fully operational.
              </p>
            </div>

            <div className="pt-2">
              <a 
                href="https://aistudio.google.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-500 font-bold hover:underline flex items-center gap-1.5"
              >
                Obtain Gemini API Key <Key className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
