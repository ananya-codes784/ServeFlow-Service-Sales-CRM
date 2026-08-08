import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { Wrench, ArrowLeft, Save } from 'lucide-react';

const ServiceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      const res = await api.get('/hr/technicians');
      return res.data.data;
    },
  });

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    address: '',
    technicianId: '',
    technicianName: '',
    scheduledDate: '',
    serviceType: 'PREVENTIVE',
    visitNotes: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      navigate('/services');
    },
  });

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = customers?.find((c: any) => c._id === e.target.value);
    if (selected) {
      setFormData({
        ...formData,
        customerId: selected._id,
        customerName: selected.companyName,
        address: `${selected.address}, ${selected.city}`,
      });
    }
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = technicians?.find((t: any) => t._id === e.target.value);
    if (selected) {
      setFormData({
        ...formData,
        technicianId: selected._id,
        technicianName: selected.name,
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
        title="Schedule Service Call"
        subtitle="Dispatch field service visit for preventive maintenance or breakdown response"
        icon={Wrench}
        action={
          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Services
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Assign Technician</label>
            <select
              onChange={handleTechChange}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="">-- Select Technician --</option>
              {technicians?.map((t: any) => (
                <option key={t._id} value={t._id}>{t.name} ({t.department})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="PREVENTIVE">Preventive Maintenance</option>
              <option value="BREAKDOWN">Breakdown Call</option>
              <option value="INSTALLATION">New Installation</option>
              <option value="AMC_VISIT">AMC Scheduled Visit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Scheduled Date *</label>
            <input
              type="date"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Visit Notes & Instructions</label>
            <textarea
              rows={3}
              value={formData.visitNotes}
              onChange={(e) => setFormData({ ...formData, visitNotes: e.target.value })}
              placeholder="Special safety equipment requirements or site access instructions..."
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" /> Save Service Call
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceCreatePage;
