import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { User, Mail, Phone, Building2, Shield, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  
  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { name, phone, department });
      const updatedUser = res.data.data;
      
      // Update local storage user data
      const token = localStorage.getItem('crm_token') || '';
      localStorage.setItem('crm_user', JSON.stringify({ ...user, ...updatedUser }));
      
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile details.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setPassLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPassMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to change password.',
      });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="My Account Profile"
        subtitle="Manage your personal details, department, and security settings"
        icon={User}
      />

      {/* User Info Overview Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-brand-500/20">
          {user?.name?.charAt(0) || 'U'}
        </div>

        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-white">{user?.name || 'User'}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
              {user?.role || 'ADMIN'}
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-500" /> {user?.email || 'user@servewell.com'}
          </p>
          <p className="text-xs text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" /> Department: <span className="text-slate-200 font-medium">{user?.department || 'Executive Management'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Profile Information</h3>
              <p className="text-xs text-slate-400">Update your name, contact phone & department</p>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 800-555-0199"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Service Operations"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {profileLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile Details
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Password Form */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security & Password</h3>
              <p className="text-xs text-slate-400">Update your login security credentials</p>
            </div>
          </div>

          {passMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                passMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}
            >
              {passMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {passLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" /> Update Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
