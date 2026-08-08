import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { Building2, ArrowLeft, Save } from 'lucide-react';

const EmployeeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Field Engineering',
    designation: 'Service Engineer',
    joiningDate: '',
    baseSalary: 4200,
    status: 'ACTIVE',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/hr', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      navigate('/hr/employees');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Add New Employee"
        subtitle="Create staff member profile for HR and technician dispatch"
        icon={Building2}
        action={
          <button
            onClick={() => navigate('/hr/employees')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Rivera"
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
              placeholder="alex@servewell.com"
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
              placeholder="+1 800-555-0822"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="Field Engineering">Field Engineering</option>
              <option value="Service Operations">Service Operations</option>
              <option value="Sales & Business">Sales & Business</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="HR & Admin">HR & Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Designation *</label>
            <input
              type="text"
              required
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Senior Service Engineer"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Joining Date *</label>
            <input
              type="date"
              required
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Monthly Base Salary ($) *</label>
            <input
              type="number"
              required
              value={formData.baseSalary}
              onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/hr/employees')}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" /> Save Employee Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeCreatePage;
