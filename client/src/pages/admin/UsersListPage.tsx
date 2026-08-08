import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { Shield, Plus, UserPlus, Mail, Lock, User, Phone, Building2, Trash2, Edit } from 'lucide-react';
import { UserRole } from '../../../../shared';

const UsersListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123');
  const [role, setRole] = useState<string>(UserRole.TECHNICIAN);
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Field Engineering');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await api.get('/admin/users');
      return res.data.data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await api.post('/admin/users', userData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('Password123');
      setPhone('');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create user account.');
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.put(`/admin/users/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    createUserMutation.mutate({ name, email, password, role, phone, department });
  };

  const columns = [
    {
      header: 'Full Name',
      accessorKey: 'name',
      cell: (info: any) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-600/30 text-brand-300 font-bold text-xs flex items-center justify-center border border-brand-500/20">
            {info.getValue()?.charAt(0) || 'U'}
          </div>
          <span className="font-semibold text-slate-100">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: 'Email Address',
      accessorKey: 'email',
      cell: (info: any) => <span className="text-slate-300 text-xs">{info.getValue()}</span>,
    },
    {
      header: 'System Role',
      accessorKey: 'role',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Department',
      accessorKey: 'department',
      cell: (info: any) => <span className="text-slate-400 text-xs">{info.getValue() || 'General'}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (info: any) => {
        const active = info.getValue() !== false;
        const row = info.row.original;
        return (
          <button
            onClick={() => toggleUserStatusMutation.mutate({ id: row._id, isActive: !active })}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
              active
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/25'
            }`}
          >
            {active ? 'Active' : 'Disabled'}
          </button>
        );
      },
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const userItem = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to remove ${userItem.name}?`)) {
                  deleteUserMutation.mutate(userItem._id);
                }
              }}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Delete user account"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading user administration accounts..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Administration & Roles"
        subtitle="Manage real system user accounts, RBAC permissions & access control"
        icon={Shield}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add System User
          </button>
        }
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search user name, email, department..." />

      {/* Add User Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New System User Account">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="e.g. Vikram Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="vikram@servewell.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Initial Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="glass-input w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900 text-slate-200"
              >
                <option value={UserRole.ADMIN}>ADMIN</option>
                <option value={UserRole.MANAGER}>MANAGER</option>
                <option value={UserRole.TECHNICIAN}>TECHNICIAN</option>
                <option value={UserRole.CUSTOMER}>CUSTOMER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
              <input
                type="text"
                placeholder="Field Operations"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="glass-input w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
            <input
              type="text"
              placeholder="+1 800-555-0900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="glass-input w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createUserMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 disabled:opacity-50"
            >
              {createUserMutation.isPending ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersListPage;
