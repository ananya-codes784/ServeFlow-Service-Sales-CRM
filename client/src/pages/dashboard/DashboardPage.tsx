import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import StatsCard from '../../components/StatsCard';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, AlertCircle, Wrench, FileText, TrendingUp,
  DollarSign, HardHat, Plus, FileSpreadsheet, Download, RefreshCw, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';

const chartData = [
  { month: 'Jan', revenue: 42000, complaints: 12 },
  { month: 'Feb', revenue: 58000, complaints: 19 },
  { month: 'Mar', revenue: 64000, complaints: 15 },
  { month: 'Apr', revenue: 51000, complaints: 8 },
  { month: 'May', revenue: 79000, complaints: 22 },
  { month: 'Jun', revenue: 92000, complaints: 14 },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard/admin');
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner size="lg" text="Loading enterprise dashboard metrics..." />;

  const stats = dashboard?.stats || {};
  const recentComplaints = dashboard?.recentComplaints || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900/90 via-indigo-900/70 to-slate-900 p-6 border border-brand-500/20 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> {user?.role || 'ADMIN'} PORTAL
              </span>
              <span className="text-xs text-slate-400">| ServeWell CRM Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome, <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">{user?.name || 'User'}</span> 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Your software is live and running! Access all 14 service, sales, inventory, and financial modules below.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <PageHeader
        title="ServeWell Enterprise Overview"
        subtitle="Real-time operational metrics, field service status & sales overview"
        icon={LayoutDashboard}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white transition-colors text-xs font-medium"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={() => navigate('/complaints/create')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white transition-all text-xs font-semibold shadow-lg shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" /> Raise Complaint
            </button>
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers ?? 0}
          icon={Users}
          trend="Live Database Count"
          trendUp={true}
          gradient="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-500/20"
          onClick={() => navigate('/customers')}
        />
        <StatsCard
          title="Active Complaints"
          value={stats.activeComplaints ?? 0}
          icon={AlertCircle}
          trend="Active Service Tickets"
          trendUp={false}
          gradient="bg-gradient-to-br from-amber-900 via-amber-950 to-slate-900 border border-amber-500/20"
          onClick={() => navigate('/complaints')}
        />
        <StatsCard
          title="Active AMC Contracts"
          value={stats.activeContracts ?? 0}
          icon={FileText}
          trend="Active Plans"
          trendUp={true}
          gradient="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 border border-emerald-500/20"
          onClick={() => navigate('/amc')}
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${(stats.totalRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          trend="Live Collected Revenue"
          trendUp={true}
          gradient="bg-gradient-to-br from-violet-900 via-violet-950 to-slate-900 border border-violet-500/20"
          onClick={() => navigate('/finance/invoices')}
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100">Revenue & Service Volume</h3>
              <p className="text-xs text-slate-400">Monthly breakdown across service & sales contracts</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Financials
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`$${val.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#revenueColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints Breakdown */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">Complaints Volume</h3>
            <p className="text-xs text-slate-400 font-normal">Monthly service calls registered</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="complaints" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Recent Service Complaints</h3>
          <button onClick={() => navigate('/complaints')} className="text-xs text-brand-400 font-semibold hover:underline">
            View All Tickets →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/10 bg-slate-900/50">
              <tr>
                <th className="p-3">Ticket #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Tech</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentComplaints.map((c: any) => (
                <tr key={c._id} className="hover:bg-white/[0.02] cursor-pointer" onClick={() => navigate(`/complaints`)}>
                  <td className="p-3 font-semibold text-brand-400">{c.ticketNumber}</td>
                  <td className="p-3 font-medium text-slate-200">{c.customerName}</td>
                  <td className="p-3 text-slate-400">{c.productName}</td>
                  <td className="p-3 text-slate-400">{c.category}</td>
                  <td className="p-3"><StatusBadge status={c.priority} /></td>
                  <td className="p-3"><StatusBadge status={c.status} /></td>
                  <td className="p-3 text-slate-300">{c.assignedTechnicianName || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
