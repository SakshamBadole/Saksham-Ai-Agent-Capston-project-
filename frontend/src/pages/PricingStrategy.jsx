import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Terminal, 
  ChevronRight, 
  AlertTriangle,
  Play
} from 'lucide-react';
import api from '../services/api';

const PricingStrategy = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
        setSelectedProductId(res.data[0].id.toString());
        loadLatestRecommendation(res.data[0].id);
      } else {
        setProducts([]);
        setSelectedProductId('');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadLatestRecommendation = async (pId) => {
    try {
      const res = await api.get(`/api/pricing/recommendations/${pId}`);
      if (res.data.length > 0) {
        // Find latest pending one or just the latest one
        const latest = res.data[0];
        setRecommendation(latest);
      } else {
        setRecommendation(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProductChange = (e) => {
    const pId = e.target.value;
    setSelectedProductId(pId);
    setRecommendation(null);
    setLogs([]);
    setActionMessage({ type: '', text: '' });
    loadLatestRecommendation(pId);
  };

  const handleTriggerAgentPipeline = async () => {
    if (!selectedProductId) return;
    setAnalyzing(true);
    setRecommendation(null);
    setActionMessage({ type: '', text: '' });
    
    // Read the target margin from settings or default to 0.20
    const storedMargin = parseFloat(localStorage.getItem('target_margin') || '0.20');
    
    setLogs(["[System] Dispatching autonomous e-commerce agents..."]);
    
    try {
      const res = await api.post(`/api/pricing/analyze/${selectedProductId}?target_margin=${storedMargin}`);
      
      // Simulate slow streaming logging to increase UI responsiveness and high-end feel
      const incomingLogs = res.data.agent_logs;
      let logIndex = 0;
      
      const interval = setInterval(() => {
        if (logIndex < incomingLogs.length) {
          setLogs(prev => [...prev, incomingLogs[logIndex]]);
          logIndex++;
        } else {
          clearInterval(interval);
          setRecommendation({
            id: res.data.recommendation_id,
            recommended_price: res.data.recommended_price,
            reason: res.data.reason,
            confidence_score: res.data.confidence_score,
            status: res.data.status
          });
          setAnalyzing(false);
        }
      }, 500);

    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, "[Error] Agent pipeline execution aborted due to database connection issue."]);
      setAnalyzing(false);
    }
  };

  const handleAcceptPrice = async () => {
    if (!recommendation) return;
    try {
      const res = await api.post(`/api/pricing/accept/${recommendation.id}`);
      setRecommendation(res.data);
      setActionMessage({ type: 'success', text: 'Pricing Strategy Accepted! New price successfully pushed to live catalogs.' });
      // Update catalog prices list
      fetchProducts();
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: 'Failed to apply new price strategy.' });
    }
  };

  const handleRejectPrice = async () => {
    if (!recommendation) return;
    try {
      const res = await api.post(`/api/pricing/reject/${recommendation.id}`);
      setRecommendation(res.data);
      setActionMessage({ type: 'info', text: 'Pricing strategy dismissed. Keeping original pricing.' });
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'error', text: 'Failed to dismiss pricing recommendation.' });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-12 h-12 text-brand-500 animate-pulse" />
          <span className="text-sm text-slate-500">Syncing dynamic margins parameters...</span>
        </div>
      </div>
    );
  }

  const activeProduct = products.find(p => p.id.toString() === selectedProductId);
  const priceDifference = recommendation && activeProduct
    ? recommendation.recommended_price - activeProduct.current_price
    : 0;

  return (
    <div className="space-y-8">
      {/* Selector Box */}
      <div className="glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimize Target SKU</label>
          <select
            value={selectedProductId}
            onChange={handleProductChange}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200 font-semibold"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.product_name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleTriggerAgentPipeline}
          disabled={analyzing}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/10 flex items-center gap-2 transition-all"
        >
          <BrainCircuit className="w-4 h-4" />
          {analyzing ? 'Agents coordinating...' : 'Trigger Multi-Agent Pricing Run'}
        </button>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Recommendation output details */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {!recommendation && !analyzing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 text-center rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 py-16 flex flex-col items-center"
              >
                <Play className="w-12 h-12 text-slate-400 dark:text-slate-600 mb-4" />
                <h4 className="text-sm font-bold text-slate-750 dark:text-slate-350">Pricing recommendation engine idle</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                  Trigger the AI agent pipeline using the selector above. Our agent collective will inspect competitive catalogs, forecast customer sales demand, verify margins, and suggest optimizations.
                </p>
              </motion.div>
            ) : analyzing && !recommendation ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 rounded-2xl border border-brand-500/20 bg-brand-500/5 py-16 flex flex-col items-center text-center gap-3"
              >
                <BrainCircuit className="w-12 h-12 text-brand-500 animate-spin" />
                <h4 className="text-sm font-bold text-brand-500">Autonomous Agents Interacting</h4>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  The agents are processing time-series inputs, calculating elasticity coefficients, and building consensus logs in the console.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="glass-card p-6 rounded-2xl space-y-6"
              >
                {/* Recommendation Header */}
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250">Strategic Analysis Recommendation</h3>
                    <span className="text-[10px] text-slate-400">ID: {recommendation.id} &bull; Status: {recommendation.status.toUpperCase()}</span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${
                    recommendation.status === 'applied' ? 'bg-emerald-500/10 text-emerald-500' :
                    recommendation.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    {recommendation.status.toUpperCase()}
                  </span>
                </div>

                {/* Price block comparison */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                    <span className="text-[10px] text-slate-400 font-semibold block">CURRENT PRICE</span>
                    <span className="text-lg font-bold text-slate-600 dark:text-slate-400 mt-1 block">${activeProduct?.current_price.toFixed(2)}</span>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                    <span className="text-[10px] text-brand-500 font-bold block">RECOMMENDED</span>
                    <span className="text-lg font-extrabold text-brand-600 dark:text-white mt-1 block">${recommendation.recommended_price.toFixed(2)}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/30 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 font-semibold block">ESTIMATED IMPACT</span>
                    <span className={`text-xs font-extrabold mt-1 ${priceDifference >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {priceDifference >= 0 ? `+ $${priceDifference.toFixed(2)}` : `- $${Math.abs(priceDifference).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                {/* Confidence bar & reasoning */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Agent Consensus Confidence</span>
                      <span className="text-slate-800 dark:text-slate-200">{Math.round(recommendation.confidence_score * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-500"
                        style={{ width: `${recommendation.confidence_score * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-brand-500/10 text-brand-500 mt-0.5">
                        <BrainCircuit className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Gemini Pricing Specialist Strategy</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-1.5 leading-relaxed">
                          {recommendation.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {recommendation.status === 'pending' && (
                  <div className="flex gap-4 pt-2">
                    <button 
                      onClick={handleAcceptPrice}
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept & Apply Strategy
                    </button>
                    <button 
                      onClick={handleRejectPrice}
                      className="py-3.5 px-6 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl transition-all"
                    >
                      Dismiss Recommendation
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* User notifications after approval actions */}
          {actionMessage.text && (
            <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-3 ${
              actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
              actionMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
              'bg-slate-100 dark:bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              {actionMessage.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{actionMessage.text}</span>
            </div>
          )}
        </div>

        {/* Live console logs board */}
        <div className="lg:col-span-2 flex flex-col bg-slate-950 border border-slate-900 rounded-2xl p-6 font-mono text-[10px] h-[480px] overflow-hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-900 text-slate-500 shrink-0">
            <Terminal className="w-4 h-4" />
            <span>AI AGENT CONSENSUS CONSOLE</span>
          </div>

          <div className="flex-1 py-4 space-y-2 overflow-y-auto pr-1 text-slate-350 min-h-0">
            {logs.length === 0 && (
              <div className="h-full flex items-center justify-center flex-col text-slate-650 font-sans text-center">
                <Terminal className="w-8 h-8 text-slate-800 mb-2" />
                <span>Console empty. Launch the agent workflow to inspect live calculations.</span>
              </div>
            )}
            {logs.map((log, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -3 }}
                animate={{ opacity: 1, x: 0 }}
                key={idx}
                className={`${
                  log.includes('[Error]') ? 'text-rose-400' :
                  log.includes('[Pricing Specialist Agent]') ? 'text-brand-400' :
                  log.includes('[Competitor Analyst Agent]') ? 'text-emerald-400' :
                  log.includes('[Demand Forecaster Agent]') ? 'text-indigo-400' :
                  'text-slate-400'
                }`}
              >
                {log}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingStrategy;
