import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Sidebar from './Sidebar';
import GlobalSearch from '../components/GlobalSearch';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch unread notification count for the bell badge
  const { data: notifData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const unreadCount = notifData?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell - navigates to /notifications */}
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              title="View all notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white px-1 animate-pulse shadow-lg shadow-brand-500/30">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-white/10" />

            {/* User Profile */}
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity p-1.5 rounded-xl hover:bg-white/5"
              title="Click to view My Profile"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-medium">{user?.role || 'ADMIN'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
