import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    gstNumber: '',
    taxPercentage: 18,
    currencySymbol: '$',
    ticketPrefix: 'TKT',
  });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        companyName: settings.companyName || 'ServeWell Enterprise Solutions',
        companyEmail: settings.companyEmail || 'support@servewell.com',
        companyPhone: settings.companyPhone || '+1 (800) 555-SERV',
        gstNumber: settings.gstNumber || '29ABCDE1234F1Z5',
        taxPercentage: settings.taxPercentage || 18,
        currencySymbol: settings.currencySymbol || '$',
        ticketPrefix: settings.ticketPrefix || 'TKT',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put('/admin/settings', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      setMsg({ type: 'success', text: 'System settings saved successfully!' });
      setTimeout(() => setMsg(null), 3000);
    },
    onError: (err: any) => {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update system settings.' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    updateMutation.mutate(formState);
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading company system configuration..." />;

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Company Settings & Branding"
        subtitle="Configure real organisation metadata, tax rules, ticket prefixes & notification options"
        icon={Settings}
      />

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Company Name</label>
            <input
              type="text"
              required
              value={formState.companyName}
              onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Support Email</label>
            <input
              type="email"
              required
              value={formState.companyEmail}
              onChange={(e) => setFormState({ ...formState, companyEmail: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Hotline Phone</label>
            <input
              type="text"
              value={formState.companyPhone}
              onChange={(e) => setFormState({ ...formState, companyPhone: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">GST / Tax ID</label>
            <input
              type="text"
              value={formState.gstNumber}
              onChange={(e) => setFormState({ ...formState, gstNumber: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Standard Tax Rate (%)</label>
            <input
              type="number"
              value={formState.taxPercentage}
              onChange={(e) => setFormState({ ...formState, taxPercentage: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Currency Symbol</label>
            <input
              type="text"
              value={formState.currencySymbol}
              onChange={(e) => setFormState({ ...formState, currencySymbol: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Ticket Prefix</label>
            <input
              type="text"
              value={formState.ticketPrefix}
              onChange={(e) => setFormState({ ...formState, ticketPrefix: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 disabled:opacity-50 transition-all"
          >
            {updateMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" /> Save System Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
