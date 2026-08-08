import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { FileText, ArrowLeft, Save } from 'lucide-react';

const AMCCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    planName: 'Gold Enterprise Shield (4 Vis/Yr)',
    startDate: '',
    endDate: '',
    contractValue: 4500,
    visitsPerYear: 4,
    coveredProducts: 'Heavy Duty Compressor X5, Chiller Unit Pro 4000',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/amc', {
        ...data,
        coveredProducts: data.coveredProducts.split(',').map((s: string) => s.trim()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amc-contracts'] });
      navigate('/amc');
    },
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = customers?.find((c: any) => c._id === e.target.value);
    if (selected) {
      setFormData({
        ...formData,
        customerId: selected._id,
        customerName: selected.companyName,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Add AMC Contract"
        subtitle="Register annual maintenance plan and service visit schedule for an account"
        icon={FileText}
        action={
          <button
            onClick={() => navigate('/amc')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to AMC List
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Account / Customer *</label>
            <select
              required
              onChange={handleCustomerChange}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="">-- Choose Account --</option>
              {customers?.map((c: any) => (
                <option key={c._id} value={c._id}>{c.companyName} ({c.customerCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Plan Name *</label>
            <input
              type="text"
              required
              value={formData.planName}
              onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
              placeholder="Gold Enterprise Shield (4 Vis/Yr)"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Contract Value ($) *</label>
            <input
              type="number"
              required
              value={formData.contractValue}
              onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Start Date *</label>
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">End Date *</label>
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Visits Allowed Per Year</label>
            <input
              type="number"
              required
              value={formData.visitsPerYear}
              onChange={(e) => setFormData({ ...formData, visitsPerYear: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Covered Products (Comma-separated)</label>
            <input
              type="text"
              value={formData.coveredProducts}
              onChange={(e) => setFormData({ ...formData, coveredProducts: e.target.value })}
              placeholder="Compressor X5, Chiller Pro 4000"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/amc')}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" /> Save AMC Contract
          </button>
        </div>
      </form>
    </div>
  );
};

export default AMCCreatePage;
