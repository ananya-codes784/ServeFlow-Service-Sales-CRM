import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Users, Plus, Trash2, Eye, X, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/customers', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsAddModalOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeleteId(null);
    },
  });

  const resetForm = () => {
    setFormData({
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
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const columns = [
    {
      header: 'Code',
      accessorKey: 'customerCode',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Company Name',
      accessorKey: 'companyName',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <button
            onClick={() => navigate(`/customers/${row._id}`)}
            className="font-semibold text-slate-100 hover:text-cyan-400 text-left transition"
          >
            {info.getValue()}
          </button>
        );
      },
    },
    {
      header: 'Contact Person',
      accessorKey: 'contactPerson',
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (info: any) => <span className="text-slate-400">{info.getValue()}</span>,
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'City / State',
      cell: (info: any) => {
        const row = info.row.original;
        return <span className="text-slate-400">{row.city}, {row.state}</span>;
      },
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/customers/${row._id}`)}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-semibold text-xs flex items-center gap-1 transition"
              title="Open 360 View"
            >
              <Eye className="w-3.5 h-3.5" /> 360° View
            </button>
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Delete Customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading customer directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        subtitle="Enterprise accounts, contact history, products installed & AMC history"
        icon={Users}
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </button>
        }
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search by company, person or code..." />

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Add New Customer Entry
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Company / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Industrial Corp"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robert Vance"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="robert@apexcorp.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+1 800-555-9000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="100 Innovation Parkway, Building B"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="Springfield"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="IL"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="62701"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="VIP">VIP Account</option>
                    <option value="ENTERPRISE">Enterprise Account</option>
                    <option value="GOVERNMENT">Government / PSU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GST Number</label>
                  <input
                    type="text"
                    placeholder="27AAACA12341ZX"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  <Save className="w-4 h-4" /> Save Customer Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Customer Account"
        message="Are you sure you want to delete this customer account from MongoDB Atlas?"
      />
    </div>
  );
};

export default CustomerListPage;
