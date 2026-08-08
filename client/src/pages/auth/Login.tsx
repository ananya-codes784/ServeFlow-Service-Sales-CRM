import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, ArrowRight, CheckCircle2, User, Building2, LayoutGrid, Zap, BarChart3 } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage || '';
  
  const [loginType, setLoginType] = useState<'ADMIN' | 'CUSTOMER'>('ADMIN');
  const [email, setEmail] = useState('admin@servewell.com');
  const [password, setPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, type: 'ADMIN' | 'CUSTOMER') => {
    setEmail(demoEmail);
    setPassword('Password123');
    setLoginType(type);
  };

  const handleTabSwitch = (type: 'ADMIN' | 'CUSTOMER') => {
    setLoginType(type);
    if (type === 'ADMIN') {
      setEmail('admin@servewell.com');
    } else {
      setEmail('');
    }
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-brand-500/30">
      {/* Left Column - Branding & Value Prop */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 lg:p-20 relative overflow-hidden bg-slate-900 border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 via-slate-900 to-indigo-900/20 z-0" />
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[0%] right-[0%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ServeWell CRM</span>
        </div>

        <div className="relative z-10 my-16">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Streamline your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">service operations.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-10">
            The all-in-one enterprise platform for managing tickets, field technicians, sales pipelines, and customer portals.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Lightning Fast Resolution</h3>
                <p className="text-sm text-slate-500 mt-1">Automated dispatching and real-time tracking.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/20 flex-shrink-0">
                <BarChart3 className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Powerful Analytics</h3>
                <p className="text-sm text-slate-500 mt-1">Deep insights into service SLA and team performance.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-slate-500 font-medium">&copy; {new Date().getFullYear()} ServeWell Enterprise. All rights reserved.</p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px] relative z-10">
          
          <div className="md:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">ServeWell CRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Welcome back</h2>
            <p className="text-sm text-slate-400">Please enter your details to access your account.</p>
          </div>
          
          {/* Login Type Tabs */}
          <div className="flex p-1 bg-slate-900 border border-white/5 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => handleTabSwitch('ADMIN')}
              className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 ${
                loginType === 'ADMIN' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Staff
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('CUSTOMER')}
              className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 ${
                loginType === 'CUSTOMER' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Client
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-emerald-400 text-xs font-medium leading-relaxed">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-rose-400 text-xs font-bold">!</span>
              </div>
              <p className="text-rose-400 text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={loginType === 'ADMIN' ? "admin@servewell.com" : "contact@company.com"}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                <a href="#" className="text-[11px] font-medium text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative ${
                loginType === 'ADMIN' 
                  ? 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/25' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            {loginType === 'CUSTOMER' && (
              <div className="text-center mt-6">
                <p className="text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-white font-semibold hover:text-emerald-400 transition-colors">
                    Sign up now
                  </Link>
                </p>
              </div>
            )}
          </form>

          {/* Demo Quick Logins - Subtle */}
          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4 text-center">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@servewell.com', 'ADMIN')}
                className="py-2 px-3 rounded-lg bg-slate-900 border border-white/5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 group-hover:animate-pulse" /> Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('manager@servewell.com', 'ADMIN')}
                className="py-2 px-3 rounded-lg bg-slate-900 border border-white/5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:animate-pulse" /> Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('tech1@servewell.com', 'ADMIN')}
                className="py-2 px-3 rounded-lg bg-slate-900 border border-white/5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 group-hover:animate-pulse" /> Tech
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer@servewell.com', 'CUSTOMER')}
                className="py-2 px-3 rounded-lg bg-slate-900 border border-white/5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-left flex items-center gap-2 group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-pulse" /> Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
