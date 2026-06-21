import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Bell, 
  TrendingDown, 
  ChevronRight, 
  Info,
  BrainCircuit,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTableTab, setActiveTableTab] = useState('competitors');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/dashboard/stats');
      setStats(res.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load professional dashboard datasets. Verify the backend and seeder run.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  // Light markdown line parser for the AI Insights panel
  const parseInsightLine = (line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      return <h4 key={idx} className="text-sm font-bold text-slate-800 dark:text-white mt-4 mb-2">{trimmed.replace('# ', '')}</h4>;
    }
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      return <h5 key={idx} className="text-xs font-bold text-brand-500 mt-3 mb-1.5">{trimmed.replace(/^###?\s+/, '')}</h5>;
    }
    if (trimmed.startsWith('- ')) {
      const text = trimmed.replace('- ', '');
      // Highlight bold text **bold**
      const parts = text.split('**');
      return (
        <li key={idx} className="text-[11px] text-slate-650 dark:text-slate-400 my-1 list-disc pl-1 ml-4 leading-relaxed">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-slate-800 dark:text-white">{p}</strong> : p)}
        </li>
      );
    }
    if (trimmed === '') return null;
    return <p key={idx} className="text-[11px] text-slate-500 dark:text-slate-450 my-1.5 leading-relaxed">{trimmed}</p>;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-12 h-12 text-brand-500 animate-pulse" />
          <span className="text-sm text-slate-500 font-semibold">Configuring dynamic graphs and tables...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 glass-card rounded-2xl border border-rose-500/20 bg-rose-500/5 max-w-xl mx-auto text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-rose-500">Service Synced Check Failed</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6">{error}</p>
        <button onClick={fetchStats} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all">
          Re-establish Connection
        </button>
      </div>
    );
  }

  const { overview, charts, tables, notifications, ai_insights } = stats;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Notifications Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notifications.map((n, idx) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            key={idx}
            className={`p-4 rounded-xl border flex items-start gap-3 relative overflow-hidden ${
              n.type === 'inventory' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' :
              n.type === 'price_drop' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 dark:bg-white/2 rounded-full transform translate-x-8 -translate-y-8"></div>
            
            <div className="p-2 rounded-lg bg-white/40 dark:bg-slate-900/30 flex-shrink-0">
              {n.type === 'inventory' ? <AlertTriangle className="w-4 h-4" /> :
               n.type === 'price_drop' ? <TrendingDown className="w-4 h-4" /> :
               <TrendingUp className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block">{n.title}</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1 leading-normal font-medium">
                {n.message}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Products */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Products</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white font-sans">{overview.total_products}</h3>
          </div>
          <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Competitors Tracked */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Competitors</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white font-sans">{overview.competitors_tracked}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Demand Score */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Demand Score</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white font-sans">
              {overview.demand_score}<span className="text-xs text-slate-400 font-medium">/100</span>
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Revenue Potential */}
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Potential Sales (7d)</span>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans">{formatCurrency(overview.revenue_potential)}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Price Trend Graph */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pricing Trends</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Competitor Price vs Our Price</h4>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.price_trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-850" />
                <XAxis dataKey="product_name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="our_price" name="Our Price ($)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="competitor_avg" name="Competitor Avg ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Demand Forecast Graph */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Forecasted Curve</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">7-Day Projected Sales Vol</h4>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.demand_forecast} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-850" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Area dataKey={['lower', 'upper']} stroke="none" fill="#10b981" fillOpacity={0.1} name="Confidence Interval" />
                <Area type="monotone" dataKey="demand" name="Units Forecast" stroke="#10b981" strokeWidth={2} fill="url(#colorDemandGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Profit Margin Graph */}
        <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ROI Margins</span>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">Active Gross Margin Percent</h4>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.profit_margins} layout="vertical" margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" className="dark:stroke-slate-850" />
                <XAxis type="number" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis type="category" dataKey="product_name" stroke="#94A3B8" fontSize={8} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }} itemStyle={{ color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="margin_percent" name="Gross Margin (%)" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Tabbed Comparison Tables */}
        <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden flex flex-col justify-between border border-slate-200/50 dark:border-slate-850">
          <div className="p-4 bg-slate-100/30 dark:bg-slate-900/10 border-b border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTableTab('competitors')}
                className={`text-xs font-bold pb-1 transition-all ${
                  activeTableTab === 'competitors' 
                    ? 'text-brand-500 border-b-2 border-brand-500' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                Competitor Comparison Table
              </button>
              <button 
                onClick={() => setActiveTableTab('forecasts')}
                className={`text-xs font-bold pb-1 transition-all ${
                  activeTableTab === 'forecasts' 
                    ? 'text-brand-500 border-b-2 border-brand-500' 
                    : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                Forecast Results Table
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">Live Matrix View</span>
          </div>

          <div className="flex-1 overflow-x-auto min-h-[300px]">
            {activeTableTab === 'competitors' ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/30 dark:bg-slate-900/5 text-slate-400 font-bold border-b border-slate-200/40 dark:border-slate-800/30">
                    <th className="p-3">COMPETITOR</th>
                    <th className="p-3">PRODUCT</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">COMP. PRICE</th>
                    <th className="p-3">OUR PRICE</th>
                    <th className="p-3">STOCK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30 font-medium text-slate-700 dark:text-slate-350">
                  {tables.competitors.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-500">No competitor listings matched.</td></tr>
                  ) : (
                    tables.competitors.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/10 dark:hover:bg-slate-900/5">
                        <td className="p-3 font-semibold">{row.competitor_name}</td>
                        <td className="p-3 truncate max-w-[120px]" title={row.product_name}>{row.product_name}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{row.sku}</td>
                        <td className="p-3 font-bold">${row.competitor_price.toFixed(2)}</td>
                        <td className="p-3 font-bold text-brand-600 dark:text-brand-400">${row.our_price.toFixed(2)}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                            row.stock_status === 'in_stock' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {row.stock_status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/30 dark:bg-slate-900/5 text-slate-400 font-bold border-b border-slate-200/40 dark:border-slate-800/30">
                    <th className="p-3">PRODUCT</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">DATE</th>
                    <th className="p-3">PREDICTED UNITS</th>
                    <th className="p-3">CONFIDENCE BOUNDS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30 font-medium text-slate-700 dark:text-slate-350">
                  {tables.forecasts.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No active forecasts found. Click to compile demand projections.</td></tr>
                  ) : (
                    tables.forecasts.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/10 dark:hover:bg-slate-900/5">
                        <td className="p-3 font-semibold truncate max-w-[120px]">{row.product_name}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{row.sku}</td>
                        <td className="p-3 text-slate-500">{row.forecast_date}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{row.predicted_quantity} units</td>
                        <td className="p-3 font-mono text-[10px] text-slate-500">{row.margin_range} units</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden border border-slate-200/50 dark:border-slate-850">
          {/* Subtle decoration vector */}
          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-500/10 rounded-full filter blur-xl"></div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-3 shrink-0">
              <Sparkles className="w-5 h-5 text-brand-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Autonomous AI Agent Briefing</h3>
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-1">
              {ai_insights.split('\n').map((line, idx) => parseInsightLine(line, idx))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/40 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
            <span>Powered by Google Gemini 2.5 Pro</span>
            <span className="flex items-center gap-1 font-bold text-brand-500 cursor-pointer hover:underline" onClick={() => fetchStats()}>
              Refresh Briefing <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
