import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import ComplaintAllocationModal from '../../components/ComplaintAllocationModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { AlertCircle, Plus, Eye, Wrench, Clock, UserPlus, Filter, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComplaintListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [allocatingTicket, setAllocatingTicket] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UNASSIGNED' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const deleteComplaintMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/complaints/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setDeleteId(null);
    },
  });

  const { data: rawComplaints = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/hr');
      return res.data.data;
    },
  });

  const filteredComplaints = rawComplaints.filter((c: any) => {
    if (filterTab === 'UNASSIGNED') return !c.assignedTechnicianId || c.status === 'NEW';
    if (filterTab === 'IN_PROGRESS') return c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED';
    if (filterTab === 'RESOLVED') return c.status === 'RESOLVED' || c.status === 'CLOSED';
    return true;
  });

  const columns = [
    {
      header: 'Ticket #',
      accessorKey: 'ticketNumber',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono">{info.getValue()}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Product',
      accessorKey: 'productName',
    },
    {
      header: 'Subject / Issue',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <p className="font-medium text-slate-200">{row.subject}</p>
            <p className="text-xs text-slate-500">{row.category}</p>
          </div>
        );
      },
    },
    {
      header: 'Priority',
      accessorKey: 'priority',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Assigned Tech',
      accessorKey: 'assignedTechnicianName',
      cell: (info: any) => {
        const val = info.getValue();
        return val ? (
          <span className="text-emerald-400 font-medium text-xs flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5" /> {val}
          </span>
        ) : (
          <span className="text-amber-400 font-medium text-xs bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Unassigned
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAllocatingTicket(row)}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition text-xs font-semibold flex items-center gap-1"
              title="Allocate Technician & Dispatch"
            >
              <UserPlus className="w-3.5 h-3.5" /> Allocate
            </button>
            <button
              onClick={() => setSelectedTicket(row)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="View History & Manage"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              title="Delete Complaint Ticket"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading breakdown tickets..." />;

  const unassignedCount = rawComplaints.filter((c: any) => !c.assignedTechnicianId || c.status === 'NEW').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Breakdown & Service Complaints"
        subtitle="Manage customer service requests, field technician allocation & ticket progression"
        icon={AlertCircle}
        action={
          <button
            onClick={() => navigate('/complaints/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Raise Service Ticket
          </button>
        }
      />

      {/* Filter Tabs & Quick Triage */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4 overflow-x-auto">
        <div className="flex items-center space-x-2">
          {[
            { id: 'ALL', label: `All Tickets (${rawComplaints.length})` },
            { id: 'UNASSIGNED', label: `Unassigned Allocation Queue (${unassignedCount})`, badge: unassignedCount > 0 },
            { id: 'IN_PROGRESS', label: 'In Progress / Dispatched' },
            { id: 'RESOLVED', label: 'Resolved / Closed' },
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
              {tab.badge && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          ))}
        </div>
      </div>

      <DataTable data={filteredComplaints} columns={columns} searchPlaceholder="Search by ticket #, customer or subject..." />

      {/* Allocation Modal */}
      <ComplaintAllocationModal
        isOpen={!!allocatingTicket}
        onClose={() => setAllocatingTicket(null)}
        complaint={allocatingTicket}
      />

      {/* Ticket Details & Timeline Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Ticket ${selectedTicket?.ticketNumber}`} size="lg">
        {selectedTicket && (
          <div className="space-y-6 text-sm text-slate-300">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">{selectedTicket.subject}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customer: <span className="text-cyan-400 font-medium">{selectedTicket.customerName}</span> ({selectedTicket.contactPhone})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedTicket.priority} />
                <StatusBadge status={selectedTicket.status} />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problem Description</h4>
              <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">{selectedTicket.description}</p>
            </div>

            {/* Assigned Tech Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Assigned Technician</span>
                <span className="text-white font-semibold">
                  {selectedTicket.assignedTechnicianName || 'Unassigned'}
                </span>
              </div>
              <button
                onClick={() => {
                  setAllocatingTicket(selectedTicket);
                  setSelectedTicket(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
              >
                {selectedTicket.assignedTechnicianName ? 'Re-allocate' : 'Allocate Tech'}
              </button>
            </div>

            {/* Timeline History */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Allocation & Service Timeline</h4>
              <div className="space-y-2">
                {selectedTicket.timeline?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <Clock className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-200">{item.comment}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">By {item.updatedBy} at {new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteComplaintMutation.mutate(deleteId)}
        title="Delete Breakdown Complaint Ticket"
        message="Are you sure you want to permanently delete this complaint ticket from MongoDB Atlas?"
      />
    </div>
  );
};

export default ComplaintListPage;

