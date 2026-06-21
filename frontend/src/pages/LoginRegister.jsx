import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, ArrowRight, AlertCircle, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, registerUser, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await registerUser(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLoginSimulate = async () => {
    setError('');
    setSubmitting(true);
    try {
      // Send a simulated google credential code that our backend translates to a validated login
      const mockCredential = `mock_google_${email || 'demo@smartseller.ai'}_${Math.floor(Math.random() * 90000) + 10000}`;
      await googleLogin(mockCredential);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden bg-mesh-dark">
      {/* Decorative Blur Spheres */}
      <div className="glow-spot w-[400px] h-[400px] bg-brand-500/10 top-[20%] left-[10%]"></div>
      <div className="glow-spot w-[350px] h-[350px] bg-emerald-500/5 bottom-[10%] right-[10%]"></div>

      {/* Main card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-card rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl p-8 relative z-25"
      >
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-lg mb-4">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-sans">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-xs mt-1 text-center">
            {isLogin 
              ? 'Access your autonomous e-commerce optimization command center' 
              : 'Register to deploy AI pricing and forecasting agents'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input 
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm focus:outline-none focus:border-brand-500 transition-colors placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Form Actions */}
          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-brand-600/10 flex items-center justify-center gap-2 group mt-6"
          >
            {submitting ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
            {!submitting && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </form>

        <div className="relative my-6 text-center text-xs text-slate-600 font-medium">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-900"></div>
          </div>
          <span className="relative bg-slate-950 px-3 z-10">OR CONTINUE WITH</span>
        </div>

        {/* Mock Google Login trigger */}
        <button 
          onClick={handleGoogleLoginSimulate}
          disabled={submitting}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 text-slate-300 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-3"
        >
          <Chrome className="w-4 h-4 text-brand-500" />
          <span>Google Login (sandbox)</span>
        </button>

        {/* Toggle Form type link */}
        <div className="mt-8 text-center text-xs text-slate-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-brand-500 font-semibold hover:underline"
          >
            {isLogin ? 'Create one now' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRegister;
