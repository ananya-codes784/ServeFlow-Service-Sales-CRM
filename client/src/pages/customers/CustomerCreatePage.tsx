import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { Users, ArrowLeft, Save } from 'lucide-react';

const CustomerCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    category: 'REGULAR',
    gstNumber: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/customers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      navigate('/customers');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Add New Customer"
        subtitle="Create an enterprise account entry with full billing and location details"
        icon={Users}
        action={
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Company / Business Name *</label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              placeholder="e.g. Apex Industrial Corp"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Contact Person *</label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="e.g. Robert Vance"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="robert@apexcorp.com"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone Number *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 800-555-9000"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Street Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="100 Innovation Parkway, Building B"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">City *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Springfield"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">State *</label>
            <input
              type="text"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="IL"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Pincode / ZIP *</label>
            <input
              type="text"
              required
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              placeholder="62701"
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
              <option value="REGULAR">Regular</option>
              <option value="VIP">VIP Account</option>
              <option value="ENTERPRISE">Enterprise Account</option>
              <option value="GOVERNMENT">Government / PSU</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">GST / Tax Identification Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="27AAACA12341ZX"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/customers')}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" /> Save Customer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerCreatePage;
