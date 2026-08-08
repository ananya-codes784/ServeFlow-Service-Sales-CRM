import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User, ArrowRight, Building2, Phone, LayoutGrid, CheckCircle2, Zap } from 'lucide-react';

const Signup: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '', // Using department field loosely as company for customer accounts
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department: formData.company,
      });
      navigate('/login', { state: { successMessage: 'Account created successfully! Please sign in.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row-reverse font-sans selection:bg-emerald-500/30">
      {/* Right Column (Visual) - Branding & Value Prop */}
      <div className="hidden md:flex flex-col justify-between w-[45%] p-12 lg:p-20 relative overflow-hidden bg-slate-900 border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-600/10 via-slate-900 to-teal-900/20 z-0" />
        <div className="absolute top-[20%] right-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-500/10 blur-[100px] mix-blend-screen" />

        <div className="relative z-10 flex items-center justify-end gap-3 w-full">
          <span className="text-xl font-bold text-white tracking-tight">ServeWell CRM</span>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="relative z-10 my-16">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
            Join the future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">client success.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md leading-relaxed mb-10">
            Get real-time visibility into your service tickets, AMC contracts, and product maintenance history all in one unified portal.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Track Service Requests</h3>
                <p className="text-sm text-slate-500 mt-1">Submit tickets and get live status updates instantly.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 flex-shrink-0">
                <Zap className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">Manage Your Products</h3>
                <p className="text-sm text-slate-500 mt-1">View installed assets, warranty dates, and AMC plans easily.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-right w-full">
          <p className="text-xs text-slate-500 font-medium">Trusted by 5,00+ enterprises worldwide.</p>
        </div>
      </div>

      {/* Left Column (Form) - Signup Form */}
      <div className="w-full md:w-[55%] flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[460px] relative z-10">
          
          <div className="md:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">ServeWell CRM</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">Create an account</h2>
            <p className="text-sm text-slate-400">Set up your client portal access in seconds.</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-rose-400 text-xs font-bold">!</span>
              </div>
              <p className="text-rose-400 text-xs font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+1 800-000-0000"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Company Name</label>
              <div className="relative group">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Corp (Optional)"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">Must be at least 6 characters long.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 px-4 rounded-xl text-white font-bold text-sm shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25 relative overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="text-center mt-8">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-semibold hover:text-emerald-400 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
