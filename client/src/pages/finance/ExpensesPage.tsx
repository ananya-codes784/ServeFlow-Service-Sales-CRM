import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  DollarSign,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  ShoppingBag,
  Wrench,
  Utensils,
  Receipt,
  AlertCircle,
  X,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

interface ExpenseItem {
  _id: string;
  expenseNumber: string;
  title: string;
  category: 'CONVEYANCE' | 'SPARE_PURCHASE' | 'FOOD_LODGING' | 'TOOLS' | 'MISC';
  amount: number;
  spentByName: string;
  relatedCustomerName?: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  expenseDate: string;
  createdAt: string;
}

const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'CONVEYANCE',
    amount: '',
    spentByName: user?.name || 'Logged User',
    relatedCustomerName: '',
    notes: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  const { data: expenses = [], isLoading } = useQuery<ExpenseItem[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await api.get('/expenses');
      return res.data.data;
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (payload: typeof newExpense) => {
      const res = await api.post('/expenses', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsSubmitModalOpen(false);
      setNewExpense({
        title: '',
        category: 'CONVEYANCE',
        amount: '',
        spentByName: user?.name || 'Logged User',
        relatedCustomerName: '',
        notes: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => {
      const res = await api.put(`/expenses/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;
    createExpenseMutation.mutate(newExpense);
  };

  const totalExpenseVal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingExpenses = expenses.filter((e) => e.status === 'PENDING');
  const pendingVal = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const conveyanceVal = expenses
    .filter((e) => e.category === 'CONVEYANCE' && e.status === 'APPROVED')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const sparesVal = expenses
    .filter((e) => e.category === 'SPARE_PURCHASE' && e.status === 'APPROVED')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const filteredExpenses = expenses.filter((e) => {
    if (filterTab === 'PENDING') return e.status === 'PENDING';
    if (filterTab === 'APPROVED') return e.status === 'APPROVED';
    if (filterTab === 'REJECTED') return e.status === 'REJECTED';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CONVEYANCE':
        return <Car className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SPARE_PURCHASE':
        return <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />;
      case 'TOOLS':
        return <Wrench className="w-3.5 h-3.5 text-amber-400" />;
      case 'FOOD_LODGING':
        return <Utensils className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Receipt className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const columns = [
    {
      header: 'Expense #',
      accessorKey: 'expenseNumber',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Title / Description',
      accessorKey: 'title',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <p className="font-semibold text-white text-sm">{row.title}</p>
            {row.relatedCustomerName && (
              <p className="text-xs text-slate-400">Customer: {row.relatedCustomerName}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (info: any) => {
        const cat = info.getValue();
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium">
            {getCategoryIcon(cat)}
            {cat.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (info: any) => <span className="font-bold text-emerald-400 text-sm">₹{info.getValue()?.toLocaleString()}</span>,
    },
    {
      header: 'Claimed By',
      accessorKey: 'spentByName',
      cell: (info: any) => <span className="text-slate-200 font-medium text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Expense Date',
      accessorKey: 'expenseDate',
      cell: (info: any) => (
        <span className="text-xs text-slate-400">{new Date(info.getValue()).toLocaleDateString()}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              val === 'APPROVED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : val === 'REJECTED'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {val}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        if (row.status !== 'PENDING') {
          return <span className="text-[10px] text-slate-500 italic">Approved by {row.approvedBy || 'Manager'}</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'APPROVED' })}
              disabled={updateStatusMutation.isPending}
              className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition text-xs font-semibold flex items-center gap-1"
              title="Approve Claim"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'REJECTED' })}
              disabled={updateStatusMutation.isPending}
              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition text-xs font-semibold flex items-center gap-1"
              title="Reject Claim"
            >
              <XCircle className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading expense claims directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expense Tracker & Field Allowances"
        subtitle="Manage field technician travel conveyance, emergency spare purchases, lodging & manager approvals"
        icon={Receipt}
        action={
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Submit Expense Claim
          </button>
        }
      />

      {/* Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Claims Value</span>
            <span className="text-2xl font-bold text-white mt-1 block">₹{totalExpenseVal.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Pending Approval Queue</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">₹{pendingVal.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500">{pendingExpenses.length} claims waiting</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Approved Conveyance</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">₹{conveyanceVal.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Car className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Approved Spare Purchases</span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">₹{sparesVal.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Triage Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Expense Claims (${expenses.length})` },
          { id: 'PENDING', label: `Pending Approval Queue (${pendingExpenses.length})`, badge: pendingExpenses.length > 0 },
          { id: 'APPROVED', label: 'Approved Claims' },
          { id: 'REJECTED', label: 'Rejected Claims' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
            {tab.badge && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </button>
        ))}
      </div>

      <DataTable data={filteredExpenses} columns={columns} searchPlaceholder="Search by claim #, title or claimer..." />

      {/* Submit Expense Claim Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-cyan-400" />
                Submit Field Expense Claim
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bike Fuel Conveyance for Customer Site Visit"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="CONVEYANCE">Conveyance / Fuel</option>
                    <option value="SPARE_PURCHASE">Spare Parts Purchase</option>
                    <option value="FOOD_LODGING">Food / Lodging</option>
                    <option value="TOOLS">Tools & Equipment</option>
                    <option value="MISC">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 450"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Claimed By *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExpense.spentByName}
                    onChange={(e) => setNewExpense({ ...newExpense, spentByName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpense.expenseDate}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Related Customer (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Industries Pvt Ltd"
                  value={newExpense.relatedCustomerName}
                  onChange={(e) => setNewExpense({ ...newExpense, relatedCustomerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Notes / Voucher Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional receipt notes..."
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExpenseMutation.isPending}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  {createExpenseMutation.isPending ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
