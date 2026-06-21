import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  ArrowRight, 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileBarChart2, 
  ShieldCheck, 
  Play, 
  ChevronRight, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [demoStep, setDemoStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState([]);

  const simulateAgents = () => {
    setIsSimulating(true);
    setDemoStep(1);
    setSimulationLogs(["[Competitor Agent] Scanning target market catalog listings..."]);
    
    setTimeout(() => {
      setDemoStep(2);
      setSimulationLogs(prev => [...prev, "[Competitor Agent] Scanned competitor ElectroMega pricing at $84.99.", "[Demand Agent] Analyzing past 90 days sales data...", "[Demand Agent] Model forecast predicts weekend sales spike (+24% volume)."]);
    }, 1500);

    setTimeout(() => {
      setDemoStep(3);
      setSimulationLogs(prev => [...prev, "[Pricing Agent] Evaluating cost constraints ($32.00) & target margin (20%).", "[Pricing Agent] Consensus optimization reached: Adjust price from $89.99 to $84.99.", "[Pricing Agent] Confidence rating: 92%."]);
    }, 3000);

    setTimeout(() => {
      setDemoStep(4);
      setSimulationLogs(prev => [...prev, "[Report Agent] Master strategy briefing compiled.", "[System] Action completed. Optimal pricing applied!"]);
      setIsSimulating(false);
    }, 4500);
  };

  const resetDemo = () => {
    setDemoStep(0);
    setSimulationLogs([]);
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden bg-mesh-dark">
      {/* Decorative backdrop glow spots */}
      <div className="glow-spot w-[500px] h-[500px] bg-brand-500/20 top-[-10%] left-[-10%]"></div>
      <div className="glow-spot w-[600px] h-[600px] bg-emerald-500/10 bottom-[-20%] right-[-10%]"></div>

      {/* Landing Header */}
      <header className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-lg">
            <BrainCircuit className="w-7 h-7" />
          </div>
          <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            SmartSeller <span className="text-emerald-500 font-bold">AI</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-semibold hover:text-brand-500 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 text-sm font-bold text-white transition-all transform hover:-translate-y-0.5"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 text-center relative z-20 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-brand-400 tracking-wider uppercase">Next-Generation Multi-Agent E-Commerce</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl font-sans leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent"
        >
          Let Autonomous AI Agents Optimize Your Store Operations
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 mt-6 text-lg sm:text-xl max-w-2xl font-light leading-relaxed"
        >
          Monitor direct competitors, calculate seasonal product demand, and dynamic-price inventory automatically using cooperative LangGraph AI agents.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 font-bold shadow-lg shadow-brand-500/20 flex items-center gap-3 group transition-all"
          >
            Launch Agent Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a 
            href="#demo"
            className="px-8 py-4 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/40 hover:bg-slate-800/80 font-bold transition-all text-slate-300"
          >
            Watch Demo Run
          </a>
        </motion.div>
      </section>

      {/* Dynamic Agent Simulator Demo */}
      <section id="demo" className="max-w-5xl mx-auto px-6 pb-32 relative z-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold font-sans">Cooperative AI Agent Pipeline</h2>
          <p className="text-slate-400 text-sm mt-2">See how our agents solve competitor analysis and dynamic pricing</p>
        </div>

        <div className="glass-card rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl p-8 relative overflow-hidden min-h-[460px]">
          {/* Neon lights */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full filter blur-3xl"></div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Visual Agent nodes mapping */}
            <div className="flex-1 space-y-4">
              <h3 className="text-md font-bold text-slate-200 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-brand-500" /> LangGraph Consensus State
              </h3>

              {/* Node 1 */}
              <div className={`p-4 rounded-xl border transition-all ${demoStep >= 1 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800 bg-slate-900/30'} flex items-center gap-4`}>
                <div className={`p-2 rounded-lg ${demoStep >= 1 ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'} flex-shrink-0`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">1. Competitor Analyst Agent</h4>
                  <p className="text-xs text-slate-400">Scrapes & matches pricing thresholds</p>
                </div>
                {demoStep >= 1 && <span className="ml-auto w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></span>}
              </div>

              {/* Node 2 */}
              <div className={`p-4 rounded-xl border transition-all ${demoStep >= 2 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800 bg-slate-900/30'} flex items-center gap-4`}>
                <div className={`p-2 rounded-lg ${demoStep >= 2 ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'} flex-shrink-0`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">2. Demand Forecaster Agent</h4>
                  <p className="text-xs text-slate-400">Trains regression on past 90 days sales</p>
                </div>
                {demoStep === 2 && <span className="ml-auto w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></span>}
              </div>

              {/* Node 3 */}
              <div className={`p-4 rounded-xl border transition-all ${demoStep >= 3 ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800 bg-slate-900/30'} flex items-center gap-4`}>
                <div className={`p-2 rounded-lg ${demoStep >= 3 ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-500'} flex-shrink-0`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">3. Pricing Specialist Agent</h4>
                  <p className="text-xs text-slate-400">Calculates optimal target margins</p>
                </div>
                {demoStep === 3 && <span className="ml-auto w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></span>}
              </div>
            </div>

            {/* Simulated Live Logs screen */}
            <div className="flex-1 flex flex-col bg-slate-950 border border-slate-800 rounded-xl p-6 font-mono text-xs overflow-hidden h-[340px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 text-slate-500 shrink-0">
                <span>AGENT PIPELINE EXECUTOR</span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  {isSimulating ? 'RUNNING' : 'IDLE'}
                </span>
              </div>
              
              <div className="flex-1 py-4 space-y-2 overflow-y-auto min-h-0 text-slate-300">
                {simulationLogs.length === 0 && (
                  <div className="h-full flex items-center justify-center flex-col text-slate-600 text-center select-none font-sans">
                    <Play className="w-12 h-12 text-slate-700 mb-3" />
                    <span>Click the trigger below to execute the LangGraph multi-agent pipeline on product sample</span>
                  </div>
                )}
                {simulationLogs.map((log, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    key={idx} 
                    className={`${log.includes('[System]') ? 'text-emerald-400 font-semibold' : log.includes('Error') ? 'text-rose-400' : 'text-slate-300'}`}
                  >
                    {log}
                  </motion.div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-between shrink-0">
                {!isSimulating && demoStep === 4 ? (
                  <button onClick={resetDemo} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-sans font-semibold">
                    Reset Demo
                  </button>
                ) : (
                  <button 
                    disabled={isSimulating}
                    onClick={simulateAgents}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white rounded font-sans font-semibold flex items-center justify-center gap-2"
                  >
                    {isSimulating ? 'Processing Agents...' : 'Trigger Strategic Pricing Run'} <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h3 className="text-center text-3xl font-extrabold mb-16 font-sans">Features Tuned for High-Volume Sellers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02]">
            <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl w-fit">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mt-6 font-sans">Automated Competitor Scraping</h4>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Agents monitor competitor price changes, rating updates, and stock levels in real time to secure listing buy-box dominance.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02]">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mt-6 font-sans">Predictive Machine Learning</h4>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Scikit-learn algorithms run on your historical sales to forecast inventory depletion. Prevents stockout margins and storage fee overheads.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all hover:scale-[1.02]">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mt-6 font-sans">Cooperative Agent Consensus</h4>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              Agents coordinate strategies before recommending adjustments, guaranteeing profit limits and ROI protections are never breached.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <h3 className="text-center text-3xl font-extrabold mb-4 font-sans">Flexible Plans for Every Stage</h3>
        <p className="text-center text-slate-400 mb-16 text-sm">Cancel, upgrade, or downgrade at any time.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card Free */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col">
            <h4 className="text-md font-semibold text-slate-400">Starter Plan</h4>
            <span className="text-3xl font-bold mt-4 font-sans">$0<span className="text-xs text-slate-500 font-normal">/mo</span></span>
            <p className="text-xs text-slate-400 mt-2">Perfect for exploring the agent framework.</p>
            
            <div className="mt-8 space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> 3 Tracked Products
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> Basic Competitor Tracking
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 line-through">
                LangGraph Custom Workflows
              </div>
            </div>

            <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
              Choose Starter
            </button>
          </div>

          {/* Card Pro */}
          <div className="glass-panel p-8 rounded-2xl border-2 border-brand-500 flex flex-col relative scale-[1.03] shadow-xl shadow-brand-500/5 bg-slate-900/60">
            <div className="absolute top-4 right-4 bg-brand-500 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
              POPULAR
            </div>
            <h4 className="text-md font-semibold text-brand-400">Growth Pro</h4>
            <span className="text-3xl font-bold mt-4 font-sans">$79<span className="text-xs text-slate-500 font-normal">/mo</span></span>
            <p className="text-xs text-slate-400 mt-2">Designed for scaling e-commerce merchants.</p>
            
            <div className="mt-8 space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited Monitored SKUs
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ML-based Demand Forecasting
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live Dynamic Pricing Recommendations
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gemini-powered Strategy Reports
              </div>
            </div>

            <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/20 transition-all">
              Start 14-day Free Trial
            </button>
          </div>

          {/* Card Enterprise */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col">
            <h4 className="text-md font-semibold text-slate-400">Enterprise Core</h4>
            <span className="text-3xl font-bold mt-4 font-sans">$249<span className="text-xs text-slate-500 font-normal">/mo</span></span>
            <p className="text-xs text-slate-400 mt-2">For multi-channel enterprise brands.</p>
            
            <div className="mt-8 space-y-3 flex-1">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> Dedicated API scrapers
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> Autonomous Pricing Executions
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-brand-500" /> SLA Response Support
              </div>
            </div>

            <button onClick={() => navigate('/login')} className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800 text-center text-slate-500 text-xs relative z-20">
        <p>&copy; 2026 SmartSeller AI. Powered by LangGraph & Google Gemini. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
