import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Sparkles,
  RefreshCw,
  BrainCircuit,
  Info
} from 'lucide-react';
import api from '../services/api';

const DemandForecast = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [historicalSales, setHistoricalSales] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringModel, setTriggeringModel] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      loadData(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
      if (res.data.length > 0) {
        setSelectedProductId(res.data[0].id.toString());
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const loadData = async (pId) => {
    try {
      // 1. Fetch sales history
      const salesRes = await api.get(`/api/demand/sales/${pId}`);
      // Sort chronologically and take last 15 days for clean chart visual
      const cleanSales = salesRes.data.map(item => ({
        date: item.date,
        quantity: item.quantity_sold,
        type: 'historical'
      })).slice(-15);
      setHistoricalSales(cleanSales);

      // 2. Fetch product details to read saved forecasts
      const prodRes = await api.get(`/api/products/${pId}`);
      const cleanForecast = prodRes.data.demand_forecasts.map(f => ({
        date: f.forecast_date,
        quantity: f.predicted_quantity,
        lower: f.lower_bound,
        upper: f.upper_bound,
        type: 'forecast'
      })).sort((a,b) => new Date(a.date) - new Date(b.date));
      setForecast(cleanForecast);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunForecastModel = async () => {
    if (!selectedProductId) return;
    setTriggeringModel(true);
    try {
      const res = await api.post(`/api/demand/forecast/${selectedProductId}`);
      const cleanForecast = res.data.map(f => ({
        date: f.forecast_date,
        quantity: f.predicted_quantity,
        lower: f.lower_bound,
        upper: f.upper_bound,
        type: 'forecast'
      })).sort((a,b) => new Date(a.date) - new Date(b.date));
      setForecast(cleanForecast);
    } catch (err) {
      console.error(err);
      alert('Unable to process sales training regression.');
    } finally {
      setTriggeringModel(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-12 h-12 text-brand-500 animate-pulse" />
          <span className="text-sm text-slate-500">Feeding sales history matrices to AI agents...</span>
        </div>
      </div>
    );
  }

  const activeProduct = products.find(p => p.id.toString() === selectedProductId);

  // Combine historical + forecast for Recharts timeline plotting
  const combinedChartData = [
    ...historicalSales,
    ...forecast
  ];

  // Calculate projected sales next 7 days
  const totalForecastedSales = forecast.reduce((acc, curr) => acc + curr.quantity, 0);
  const currentStock = activeProduct?.inventory_stock || 0;
  const isStockRisk = totalForecastedSales > currentStock;
  const daysOfRunway = totalForecastedSales > 0 
    ? Math.round((currentStock / (totalForecastedSales / 7)) * 10) / 10 
    : 99;

  return (
    <div className="space-y-8">
      {/* Selector & Forecast Trigger */}
      <div className="glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 text-slate-700 dark:text-slate-200 font-semibold"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.product_name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleRunForecastModel}
          disabled={triggeringModel}
          className="px-5 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/10 flex items-center gap-2.5 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${triggeringModel ? 'animate-spin' : ''}`} />
          {triggeringModel ? 'Training ML Regressor...' : 'Execute Regression Forecast'}
        </button>
      </div>

      {/* Stock Health Alerts */}
      {activeProduct && (
        <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isStockRisk 
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl mt-0.5 ${isStockRisk ? 'bg-amber-500/15' : 'bg-emerald-500/15'}`}>
              {isStockRisk ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {isStockRisk ? 'Critical Inventory Understock Alert' : 'Stock Levels Stable'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                {isStockRisk 
                  ? `Active product is forecasted to deplete current inventory. 7-day projected sales of ${totalForecastedSales} units exceeds remaining stock of ${currentStock} units.`
                  : `Current inventory of ${currentStock} units is sufficient to cover the forecasted 7-day customer demand of ${totalForecastedSales} units.`}
              </p>
            </div>
          </div>
          <div className="flex gap-6 shrink-0 border-l border-slate-200/50 dark:border-slate-800/40 pl-6 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="block font-semibold">Stock Runway</span>
              <span className={`text-lg font-extrabold ${isStockRisk ? 'text-amber-500' : 'text-emerald-500'}`}>{daysOfRunway} days</span>
            </div>
            <div>
              <span className="block font-semibold">Estimated Need</span>
              <span className="text-lg font-extrabold text-slate-850 dark:text-slate-200">{Math.max(totalForecastedSales - currentStock, 0)} units</span>
            </div>
          </div>
        </div>
      )}

      {/* Forecasting Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Predictive Sales Timeline</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Historical (15d) & Forecast (7d)</h3>
          </div>
          <div className="flex gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-brand-500"></span> Historical</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Projections</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 opacity-20"></span> 95% Confidence</span>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {forecast.length === 0 ? (
            <div className="h-full flex items-center justify-center flex-col text-slate-500 text-xs gap-3">
              <Calendar className="w-10 h-10 text-slate-400" />
              <span>No active forecasts stored for this product. Run forecast regression above.</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/50" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                {/* 95% Confidence envelope range */}
                <Area dataKey={['lower', 'upper']} stroke="none" fill="#10b981" fillOpacity={0.12} name="Confidence Interval" />
                
                {/* Historical Area */}
                <Area type="monotone" dataKey={(item) => item.type === 'historical' ? item.quantity : undefined} name="Historical Sales" stroke="#2563eb" strokeWidth={2} fill="url(#colorHistory)" />
                
                {/* Forecast Area */}
                <Area type="monotone" dataKey={(item) => item.type === 'forecast' ? item.quantity : undefined} name="Forecast Projections" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Forecast Breakdown Table */}
      {forecast.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40">
            <h3 className="text-sm font-bold">Daily Demand Forecast Output</h3>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 font-bold border-b border-slate-200/50 dark:border-slate-800/40">
                <th className="p-4">FORECAST DATE</th>
                <th className="p-4">PREDICTED DEMAND</th>
                <th className="p-4">CONFIDENCE INTERVAL (MIN - MAX)</th>
                <th className="p-4">IMPACTED CHANNELS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40 text-slate-700 dark:text-slate-200 font-medium">
              {forecast.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                  <td className="p-4">{new Date(f.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{f.quantity} units</td>
                  <td className="p-4 font-mono text-slate-500">{f.lower} - {f.upper} units</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                      new Date(f.date).getDay() in [5, 6] ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                    }`}>
                      {new Date(f.date).getDay() in [5, 6] ? 'High Weekend Volume' : 'Standard Weekday'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CSV/JSON Sales Log Upload & AI Analyst Integration */}
      <SalesDataUploadPanel />
    </div>
  );
};

// Sub-component for sales log upload and Gemini parsing
const SalesDataUploadPanel = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/api/demand/upload-sales', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Unable to analyze sales data file. Ensure columns fit schema guidelines.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
        <Sparkles className="w-5 h-5 text-brand-500 animate-pulse" />
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">AI Sales Log & Strategy Analyzer</h3>
          <span className="text-[10px] text-slate-400">Upload sales history to generate structured Gemini business intelligence reports</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Drag & Drop upload container */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:border-brand-500 transition-colors cursor-pointer relative bg-slate-100/10 dark:bg-slate-900/5">
              <input 
                type="file" 
                accept=".csv,.json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <TrendingUp className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                {file ? file.name : 'Select sales CSV or JSON file'}
              </span>
              <span className="text-[9px] text-slate-500 mt-1 block">Max size 4MB. Format must contain date, quantity columns</span>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={!file || uploading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 transition-all"
            >
              {uploading ? 'Agents crunching columns...' : 'Analyze Sales History'}
            </button>
          </form>
        </div>

        {/* Right: AI analysis results block */}
        <div className="lg:col-span-3 flex flex-col min-h-[220px]">
          {uploading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
              <BrainCircuit className="w-10 h-10 text-brand-500 animate-spin" />
              <span className="text-xs text-slate-550">Gemini Agent analyzing trends, risks, demand coefficients, and pricing models...</span>
            </div>
          ) : !result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-xs">
              <TrendingUp className="w-8 h-8 text-slate-400 mb-2" />
              <span>File insights dashboard will load here after analysis execution completes.</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-850 rounded-xl overflow-hidden text-xs">
              {/* Output tabs headers */}
              <div className="flex border-b border-slate-200/50 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/40 text-[10px] font-bold text-slate-450 overflow-x-auto shrink-0">
                {['summary', 'trends', 'predictions', 'risks', 'inventory', 'pricing'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-2.5 capitalize shrink-0 ${
                      activeTab === tab ? 'text-brand-500 bg-white dark:bg-slate-950 border-t-2 border-brand-500' : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Output views */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[220px] text-slate-650 dark:text-slate-350">
                {activeTab === 'summary' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Executive Briefing</span>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                      {result.executive_summary}
                    </p>
                  </div>
                )}

                {activeTab === 'trends' && (
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Seasonality Indicators</span>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{result.trends_analysis.seasonality}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Volume Velocity</span>
                      <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{result.trends_analysis.velocity}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/30">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Data Observations</span>
                      <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px]">
                        {result.trends_analysis.insights.map((ins, idx) => (
                          <li key={idx}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'predictions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Projected 7-Day Units</span>
                        <p className="text-lg font-extrabold text-slate-800 dark:text-white mt-1">
                          {result.future_demand_prediction.forecasted_total_next_7_days} units
                        </p>
                      </div>
                      <span className="text-[9px] font-bold uppercase bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2 py-0.5 rounded">
                        Confidence: {result.future_demand_prediction.confidence_rating}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-200/40 dark:border-slate-800/30">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Daily Predictions Breakdown</span>
                      <div className="grid grid-cols-7 gap-1.5 text-center">
                        {result.future_demand_prediction.daily_forecast.map((df) => (
                          <div key={df.day} className="p-2 rounded bg-slate-100 dark:bg-slate-900">
                            <span className="text-[8px] text-slate-400 block font-bold">Day {df.day}</span>
                            <span className="font-extrabold text-slate-800 dark:text-white text-xs mt-0.5 block">{df.units}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'risks' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Identified Operational Risks</span>
                    <ul className="space-y-2 mt-2">
                      {result.risks_identified.map((risk, idx) => (
                        <li key={idx} className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        <span className="text-[9px] text-slate-400 block font-bold">SAFETY STOCK BUFFER</span>
                        <span className="text-md font-extrabold text-slate-800 dark:text-white mt-1 block">{result.suggested_inventory_levels.safety_stock_buffer} units</span>
                      </div>
                      <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                        <span className="text-[9px] text-slate-400 block font-bold">RECOMMENDED REORDER</span>
                        <span className="text-md font-extrabold text-slate-800 dark:text-white mt-1 block">{result.suggested_inventory_levels.recommended_reorder_qty} units</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Reorder Rationale</span>
                      <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {result.suggested_inventory_levels.rationale}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'pricing' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Strategy Class</span>
                        <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-1">{result.suggested_pricing_strategy.strategy_type}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Suggested Adjustment</span>
                        <p className="text-sm font-bold text-emerald-500 mt-1">+{result.suggested_pricing_strategy.recommended_adjustment_percent}%</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Pricing Rationale</span>
                      <p className="mt-1 text-slate-500 dark:text-slate-450 leading-relaxed font-medium">
                        {result.suggested_pricing_strategy.rationale}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemandForecast;

