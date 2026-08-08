import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

const ComplaintCreatePage: React.FC = () => {
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
    contactPhone: '',
    productName: '',
    serialNumber: '',
    category: 'General Breakdown',
    subject: '',
    description: '',
    priority: 'MEDIUM',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/complaints', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      navigate('/complaints');
    },
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = customers?.find((c: any) => c._id === e.target.value);
    if (selected) {
      setFormData({
        ...formData,
        customerId: selected._id,
        customerName: selected.companyName,
        contactPhone: selected.phone,
        productName: selected.installedProducts?.[0]?.productName || 'Standard System Unit',
        serialNumber: selected.installedProducts?.[0]?.serialNumber || '',
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
        title="Raise Breakdown Complaint"
        subtitle="Log a service ticket for hardware failure, maintenance or calibration"
        icon={AlertCircle}
        action={
          <button
            onClick={() => navigate('/complaints')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Complaints
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="e.g. Heavy Duty Compressor X5"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Serial Number</label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              placeholder="SN-99120"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="General Breakdown">General Breakdown</option>
              <option value="Pressure Failure & Overheating">Pressure Failure & Overheating</option>
              <option value="Electrical & Wiring">Electrical & Wiring</option>
              <option value="Calibration & Tuning">Calibration & Tuning</option>
              <option value="Preventive Maintenance">Preventive Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Priority Level</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="LOW">Low Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Critical / Urgent</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Ticket Subject / Short Title *</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Compressor shutting down automatically"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Detailed Issue Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe error codes, symptoms, and site conditions..."
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" /> Submit Complaint Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComplaintCreatePage;
