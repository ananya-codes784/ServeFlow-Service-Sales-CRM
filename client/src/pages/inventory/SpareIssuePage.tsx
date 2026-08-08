import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
  PackageCheck,
  Plus,
  CheckCircle2,
  RotateCcw,
  Truck,
  Wrench,
  AlertCircle,
  X,
  Layers,
  Archive,
} from 'lucide-react';

interface SpareIssueItem {
  _id: string;
  issueNumber: string;
  spareName: string;
  partNumber?: string;
  quantity: number;
  issuedToName: string;
  issuedByName: string;
  purpose: 'FIELD_REPAIR' | 'TRUNK_STOCK' | 'PREVENTIVE_VISIT';
  relatedTicketNumber?: string;
  status: 'ISSUED' | 'CONSUMED' | 'RETURNED';
  notes?: string;
  issueDate: string;
}

const SpareIssuePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'ALL' | 'ISSUED' | 'CONSUMED' | 'RETURNED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    spareId: '',
    quantity: '1',
    issuedToName: '',
    purpose: 'FIELD_REPAIR',
    relatedTicketNumber: '',
    notes: '',
  });

  // Fetch Spare Issues
  const { data: issues = [], isLoading } = useQuery<SpareIssueItem[]>({
    queryKey: ['spare-issues'],
    queryFn: async () => {
      const res = await api.get('/spare-issues');
      return res.data.data;
    },
  });

  // Fetch Inventory items for selection dropdown
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.get('/inventory');
      return res.data.data;
    },
  });

  // Fetch Technicians list
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/hr');
      return res.data.data;
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/spare-issues', {
        ...formData,
        quantity: Number(formData.quantity),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spare-issues'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setIsModalOpen(false);
      setErrorMsg('');
      setFormData({
        spareId: '',
        quantity: '1',
        issuedToName: '',
        purpose: 'FIELD_REPAIR',
        relatedTicketNumber: '',
        notes: '',
      });
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to issue spare part.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'CONSUMED' | 'RETURNED' }) => {
      const res = await api.put(`/spare-issues/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spare-issues'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.spareId || !formData.issuedToName) {
      setErrorMsg('Please select a spare part and technician.');
      return;
    }
    createIssueMutation.mutate();
  };

  const trunkStockCount = issues.filter((i) => i.status === 'ISSUED').length;
  const consumedCount = issues.filter((i) => i.status === 'CONSUMED').length;
  const returnedCount = issues.filter((i) => i.status === 'RETURNED').length;

  const filteredIssues = issues.filter((i) => {
    if (filterTab === 'ISSUED') return i.status === 'ISSUED';
    if (filterTab === 'CONSUMED') return i.status === 'CONSUMED';
    if (filterTab === 'RETURNED') return i.status === 'RETURNED';
    return true;
  });

  const columns = [
    {
      header: 'Issue #',
      accessorKey: 'issueNumber',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Spare Part',
      accessorKey: 'spareName',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <p className="font-semibold text-white text-sm">{row.spareName}</p>
            {row.partNumber && <p className="text-[11px] text-slate-400 font-mono">PN: {row.partNumber}</p>}
          </div>
        );
      },
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
      cell: (info: any) => (
        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 font-bold text-xs border border-slate-700">
          {info.getValue()} Units
        </span>
      ),
    },
    {
      header: 'Issued To (Tech)',
      accessorKey: 'issuedToName',
      cell: (info: any) => <span className="text-white font-medium text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Issued By',
      accessorKey: 'issuedByName',
      cell: (info: any) => <span className="text-slate-400 text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Purpose / Ticket',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
              {row.purpose.replace('_', ' ')}
            </span>
            {row.relatedTicketNumber && (
              <p className="text-[11px] text-cyan-400 font-mono mt-0.5">{row.relatedTicketNumber}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => {
        const val = info.getValue();
        return (
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              val === 'CONSUMED'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : val === 'RETURNED'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}
          >
            {val === 'ISSUED' ? 'In Field Trunk' : val}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        if (row.status !== 'ISSUED') {
          return <span className="text-[10px] text-slate-500 italic">Completed</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'CONSUMED' })}
              disabled={updateStatusMutation.isPending}
              className="px-2 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition text-xs font-semibold flex items-center gap-1"
              title="Mark Consumed on Customer Repair Site"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Consumed
            </button>
            <button
              onClick={() => updateStatusMutation.mutate({ id: row._id, status: 'RETURNED' })}
              disabled={updateStatusMutation.isPending}
              className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition text-xs font-semibold flex items-center gap-1"
              title="Return Unused Spare to Warehouse Stock"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Return
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading spare issue records..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Spare Issue to Technician & Trunk Stock"
        subtitle="Manage warehouse spare parts issue, field engineer trunk inventory & real-time stock deduction"
        icon={PackageCheck}
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Issue Spare Parts
          </button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Spares Issued</span>
            <span className="text-2xl font-bold text-white mt-1 block">{issues.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">In Field Trunk Stock</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">{trunkStockCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Consumed on Site</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{consumedCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Returned to Warehouse</span>
            <span className="text-2xl font-bold text-blue-400 mt-1 block">{returnedCount}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Archive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Triage Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Spare Issues (${issues.length})` },
          { id: 'ISSUED', label: `Technician Trunk Stock (${trunkStockCount})` },
          { id: 'CONSUMED', label: `Consumed on Site (${consumedCount})` },
          { id: 'RETURNED', label: `Returned to Store (${returnedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable data={filteredIssues} columns={columns} searchPlaceholder="Search by issue #, spare name or technician..." />

      {/* Issue Spare Parts Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-cyan-400" />
                Issue Warehouse Spare to Technician
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Select Spare Inventory Item *
                </label>
                <select
                  value={formData.spareId}
                  onChange={(e) => {
                    setFormData({ ...formData, spareId: e.target.value });
                    setErrorMsg('');
                  }}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Choose Spare Item from Stock --</option>
                  {inventoryItems.map((inv: any) => (
                    <option key={inv._id} value={inv._id} disabled={inv.quantity <= 0}>
                      {inv.name || inv.itemName} (Stock: {inv.quantity} {inv.unit || 'Units'}) - ₹{inv.unitPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Quantity to Issue *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Issue Purpose
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FIELD_REPAIR">Field Breakdown Repair</option>
                    <option value="TRUNK_STOCK">Technician Trunk Stock</option>
                    <option value="PREVENTIVE_VISIT">AMC Preventive Service</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Assign to Technician / Field Engineer *
                </label>
                <select
                  value={formData.issuedToName}
                  onChange={(e) => setFormData({ ...formData, issuedToName: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="">-- Select Field Technician --</option>
                  {employees.map((emp: any) => (
                    <option key={emp._id} value={emp.name}>
                      {emp.name} ({emp.designation || 'Technician'}) - {emp.phone || 'Active'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Ticket Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TKT-2026-004"
                  value={formData.relatedTicketNumber}
                  onChange={(e) => setFormData({ ...formData, relatedTicketNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createIssueMutation.isPending}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  {createIssueMutation.isPending ? 'Processing...' : 'Deduct & Issue Spare'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpareIssuePage;
