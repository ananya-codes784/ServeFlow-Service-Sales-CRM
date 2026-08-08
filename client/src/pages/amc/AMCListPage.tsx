import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FileText,
  Plus,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  BellRing,
  CheckCircle2,
  Calendar,
  DollarSign,
  Clock,
  Wrench,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const AMCListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrModalData, setQrModalData] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'DUE' | 'EXPIRING' | 'EXPIRED'>('ALL');

  const deleteAMCMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/amc/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amc-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeleteId(null);
    },
  });

  const { data: rawContracts = [], isLoading } = useQuery({
    queryKey: ['amc-contracts'],
    queryFn: async () => {
      const res = await api.get('/amc');
      return res.data.data;
    },
  });

  const recordVisitMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const res = await api.post(`/amc/${contractId}/record-visit`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amc-contracts'] });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (contractId: string) => {
      const res = await api.post(`/amc/${contractId}/send-reminder`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amc-contracts'] });
    },
  });

  const now = new Date().getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const activeContracts = rawContracts.filter((c: any) => c.status === 'ACTIVE');
  const expiringContracts = rawContracts.filter((c: any) => {
    const end = new Date(c.endDate).getTime();
    return c.status === 'ACTIVE' && end - now <= thirtyDaysMs && end - now > 0;
  });
  const dueContracts = rawContracts.filter((c: any) => c.visitsCompleted < c.visitsPerYear && c.status === 'ACTIVE');
  const totalRevenue = rawContracts.reduce((sum: number, c: any) => sum + (c.contractValue || 0), 0);

  const filteredContracts = rawContracts.filter((c: any) => {
    if (filterTab === 'DUE') return c.visitsCompleted < c.visitsPerYear && c.status === 'ACTIVE';
    if (filterTab === 'EXPIRING') {
      const end = new Date(c.endDate).getTime();
      return c.status === 'ACTIVE' && end - now <= thirtyDaysMs;
    }
    if (filterTab === 'EXPIRED') return c.status === 'EXPIRED' || new Date(c.endDate).getTime() < now;
    return true;
  });

  const columns = [
    {
      header: 'Contract #',
      accessorKey: 'contractNumber',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono">{info.getValue()}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Plan Name',
      accessorKey: 'planName',
      cell: (info: any) => <span className="font-medium text-slate-200">{info.getValue()}</span>,
    },
    {
      header: 'Validity Period',
      cell: (info: any) => {
        const row = info.row.original;
        const endDate = new Date(row.endDate).getTime();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 3600 * 24));
        const isExpiring = daysLeft > 0 && daysLeft <= 30;
        return (
          <div>
            <p className="text-xs text-slate-300">
              {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
            </p>
            {isExpiring && (
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" /> Expires in {daysLeft} days
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Visits Tracker',
      cell: (info: any) => {
        const row = info.row.original;
        const isCompleted = row.visitsCompleted >= row.visitsPerYear;
        return (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-200">
              {row.visitsCompleted} of {row.visitsPerYear} Visits
            </span>
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${isCompleted ? 'bg-emerald-400' : 'bg-cyan-500'}`}
                style={{ width: `${Math.min(100, (row.visitsCompleted / row.visitsPerYear) * 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Value',
      accessorKey: 'contractValue',
      cell: (info: any) => <span className="font-bold text-emerald-400">₹{info.getValue()?.toLocaleString()}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => recordVisitMutation.mutate(row._id)}
              disabled={recordVisitMutation.isPending || row.visitsCompleted >= row.visitsPerYear}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
              title="Record Preventive Visit Done"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> + Visit
            </button>
            <button
              onClick={() => sendReminderMutation.mutate(row._id)}
              disabled={sendReminderMutation.isPending}
              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition"
              title="Send Renewal / Expiry Notification"
            >
              <BellRing className="w-4 h-4" />
            </button>
            <button
              onClick={() => setQrModalData(row)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Digital Pass QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              title="Delete AMC Contract"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading AMC Contract Directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Annual Maintenance Contracts (AMC)"
        subtitle="Manage active customer AMC plans, preventive service schedules, contract expiry summary & automated alerts"
        icon={ShieldCheck}
        action={
          <button
            onClick={() => navigate('/amc/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Create AMC Contract
          </button>
        }
      />

      {/* Executive Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Active AMC Contracts</span>
            <span className="text-2xl font-bold text-white mt-1 block">{activeContracts.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Expiring in 30 Days</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">{expiringContracts.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Preventive Services Due</span>
            <span className="text-2xl font-bold text-cyan-400 mt-1 block">{dueContracts.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total AMC Revenue</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">₹{totalRevenue.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Triage Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Contracts (${rawContracts.length})` },
          { id: 'DUE', label: `Service Due Queue (${dueContracts.length})` },
          { id: 'EXPIRING', label: `Expiring Soon (${expiringContracts.length})` },
          { id: 'EXPIRED', label: 'Expired / Renewal Needed' },
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

      <DataTable data={filteredContracts} columns={columns} searchPlaceholder="Search by contract #, plan or customer..." />

      {/* QR Code Pass Modal */}
      <Modal isOpen={!!qrModalData} onClose={() => setQrModalData(null)} title="AMC Digital Service Pass" size="sm">
        {qrModalData && (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl shadow-xl">
              <QRCodeSVG value={`SERVEWELL_AMC:${qrModalData.contractNumber}`} size={160} />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-base">{qrModalData.contractNumber}</p>
              <p className="text-xs text-cyan-400 font-semibold">{qrModalData.customerName}</p>
              <p className="text-xs text-slate-500 mt-1">Scan for digital contract verification & site visit logging</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteAMCMutation.mutate(deleteId)}
        title="Delete AMC Contract"
        message="Are you sure you want to permanently delete this AMC contract from MongoDB Atlas?"
      />
    </div>
  );
};

export default AMCListPage;
