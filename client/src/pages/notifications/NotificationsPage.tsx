import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Bell, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle2,
  XCircle, Zap, ExternalLink, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const typeStyles: Record<string, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  SUCCESS: { icon: CheckCircle2, bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  WARNING: { icon: AlertTriangle, bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  ERROR: { icon: XCircle, bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  INFO: { icon: Info, bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20' },
  SYSTEM: { icon: Zap, bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
};

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/notifications');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" text="Loading notification center..." />;

  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  const filtered = activeFilter === 'ALL'
    ? notifications
    : activeFilter === 'UNREAD'
    ? notifications.filter((n: any) => !n.isRead)
    : notifications.filter((n: any) => n.type === activeFilter);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filters = ['ALL', 'UNREAD', 'SUCCESS', 'WARNING', 'INFO', 'ERROR', 'SYSTEM'];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Notification Center"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''} • All system alerts, updates & activity logs`}
        icon={Bell}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending || unreadCount === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors disabled:opacity-40"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
            <button
              onClick={() => {
                if (window.confirm('Clear all notifications? This cannot be undone.')) {
                  clearAllMutation.mutate();
                }
              }}
              disabled={clearAllMutation.isPending || notifications.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-900/30 border border-rose-500/20 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all border ${
              activeFilter === f
                ? 'bg-brand-600/20 text-brand-300 border-brand-500/30'
                : 'bg-slate-900/50 text-slate-400 border-white/5 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            {f}
            {f === 'UNREAD' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center">
          <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeFilter === 'ALL'
              ? 'All clear! Notifications from system actions will appear here.'
              : `No ${activeFilter.toLowerCase()} notifications found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif: any) => {
            const style = typeStyles[notif.type] || typeStyles.INFO;
            const Icon = style.icon;
            return (
              <div
                key={notif._id}
                className={`glass-panel rounded-2xl border ${notif.isRead ? 'border-white/5 opacity-70' : `${style.border} shadow-md`} p-4 flex items-start gap-4 group transition-all hover:bg-white/[0.02] cursor-pointer`}
                onClick={() => {
                  if (!notif.isRead) markReadMutation.mutate(notif._id);
                  if (notif.link) navigate(notif.link);
                }}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl ${style.bg} flex-shrink-0 mt-0.5`}>
                  <Icon className={`w-5 h-5 ${style.text}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs ${notif.isRead ? 'text-slate-500' : 'text-slate-300'} leading-relaxed`}>
                        {notif.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}>
                        {notif.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(notif.createdAt)}
                    </span>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {notif.link && (
                        <span className="text-[10px] text-brand-400 flex items-center gap-0.5 font-medium">
                          <ExternalLink className="w-3 h-3" /> Open
                        </span>
                      )}
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markReadMutation.mutate(notif._id);
                          }}
                          className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium hover:underline"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
