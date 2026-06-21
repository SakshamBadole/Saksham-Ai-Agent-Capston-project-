import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  Users, 
  Plus, 
  Trash2, 
  ExternalLink, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight, 
  Info,
  BrainCircuit
} from 'lucide-react';
import api from '../services/api';

const CompetitorAnalysis = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [compName, setCompName] = useState('');
  const [compUrl, setCompUrl] = useState('');
  const [compPrice, setCompPrice] = useState('');
  const [compStock, setCompStock] = useState('in_stock');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchCompetitors(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
        setSelectedProductId(res.data[0].id.toString());
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

  const fetchCompetitors = async (pId) => {
    try {
      const res = await api.get(`/api/competitors/product/${pId}`);
      setCompetitors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCompetitor = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/competitors', {
        product_id: parseInt(selectedProductId),
        competitor_name: compName,
        competitor_url: compUrl || null,
        competitor_price: parseFloat(compPrice),
        stock_status: compStock,
        rating: 4.2
      });
      // Clear form
      setCompName('');
      setCompUrl('');
      setCompPrice('');
      setCompStock('in_stock');
      // Refresh list
      fetchCompetitors(selectedProductId);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register competitor listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompetitor = async (cId) => {
    if (!window.confirm('Are you sure you want to stop tracking this competitor?')) return;
    try {
      await api.delete(`/api/competitors/${cId}`);
      fetchCompetitors(selectedProductId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <BrainCircuit className="w-12 h-12 text-brand-500 animate-pulse" />
          <span className="text-sm text-slate-500">Querying pricing lists...</span>
        </div>
      </div>
    );
  }

  const activeProduct = products.find(p => p.id.toString() === selectedProductId);

  // Prepare chart data: Include our current product price and competitor prices
  const chartData = [
    ...(activeProduct ? [{ name: 'Our Price', price: activeProduct.current_price, fill: '#2563eb' }] : []),
    ...competitors.map(c => ({
      name: c.competitor_name,
      price: c.competitor_price,
      fill: '#10b981'
    }))
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Selector & Data Lists */}
      <div className="lg:col-span-2 space-y-8">
        {/* Selector Header card */}
        <div className="glass-card p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-col space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Catalog Item</label>
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

          {activeProduct && (
            <div className="flex gap-6 text-xs border-l border-slate-200 dark:border-slate-850 pl-6">
              <div>
                <span className="text-slate-400 block">Current Price</span>
                <span className="font-bold text-sm text-slate-800 dark:text-white">${activeProduct.current_price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Cost Basis</span>
                <span className="font-bold text-sm text-slate-800 dark:text-white">${activeProduct.cost_price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Inventory</span>
                <span className={`font-bold text-sm ${activeProduct.inventory_stock < 50 ? 'text-amber-500' : 'text-emerald-500'}`}>{activeProduct.inventory_stock} units</span>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Chart comparison */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6">Price Comparison Matrix</h3>
          <div className="h-[250px] w-full">
            {chartData.length <= 1 ? (
              <div className="h-full flex items-center justify-center flex-col text-slate-500 text-xs">
                <Users className="w-10 h-10 text-slate-400 mb-2" />
                <span>No competitors registered to track. Add details on the sidebar.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800/50" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <rect key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  {activeProduct && (
                    <ReferenceLine y={activeProduct.cost_price} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Cost', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Competitors Listings Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-250 dark:border-slate-850">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/40">
            <h3 className="text-sm font-bold">Monitored Retail Competitors</h3>
          </div>
          
          <div className="overflow-x-auto">
            {competitors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-450">
                No active competitor listings stored for this product ID.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-slate-400 font-bold border-b border-slate-200/50 dark:border-slate-800/40">
                    <th className="p-4">COMPETITOR</th>
                    <th className="p-4">CURRENT PRICE</th>
                    <th className="p-4">STOCK STATUS</th>
                    <th className="p-4">RATING</th>
                    <th className="p-4">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/40 dark:divide-slate-800/40">
                  {competitors.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-100/20 dark:hover:bg-slate-900/10">
                      <td className="p-4 font-semibold text-slate-750 dark:text-slate-200">
                        <div className="flex items-center gap-1">
                          {c.competitor_name}
                          {c.competitor_url && (
                            <a href={c.competitor_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-500">
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-100">
                        ${c.competitor_price ? c.competitor_price.toFixed(2) : '0.00'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          c.stock_status === 'in_stock' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {c.stock_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                        {c.rating ? `${c.rating.toFixed(1)} ★` : '—'}
                      </td>
                      <td className="p-4">
                        <button onClick={() => handleDeleteCompetitor(c.id)} className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Competitor Sidebar Panel Form */}
      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Track New Competitor</h3>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleAddCompetitor} className="space-y-4 text-xs font-semibold text-slate-500">
            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-wide text-[9px]">Competitor Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Amazon Choice"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-wide text-[9px]">Competitor URL (Optional)</label>
              <input
                type="url"
                placeholder="https://amazon.com/product-url"
                value={compUrl}
                onChange={(e) => setCompUrl(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-wide text-[9px]">Price ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="84.99"
                value={compPrice}
                onChange={(e) => setCompPrice(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-400 uppercase tracking-wide text-[9px]">Stock Status</label>
              <select
                value={compStock}
                onChange={(e) => setCompStock(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
              >
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="low_stock">Low Stock</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 mt-6"
            >
              {submitting ? 'Registering...' : 'Add Monitor Listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
