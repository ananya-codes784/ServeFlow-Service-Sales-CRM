import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { TrendingUp, Plus, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeadsListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['sales-leads'],
    queryFn: async () => {
      const res = await api.get('/sales/leads');
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/sales/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] });
      setDeleteId(null);
    },
  });

  const columns = [
    {
      header: 'Lead #',
      accessorKey: 'leadNumber',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono">{info.getValue()}</span>,
    },
    {
      header: 'Company / Lead Name',
      accessorKey: 'companyName',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Contact Person',
      accessorKey: 'contactPerson',
    },
    {
      header: 'Email / Phone',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="text-xs text-slate-400">
            <p>{row.email}</p>
            <p>{row.phone}</p>
          </div>
        );
      },
    },
    {
      header: 'Deal Value',
      accessorKey: 'dealValue',
      cell: (info: any) => <span className="font-bold text-emerald-400">₹{info.getValue()?.toLocaleString()}</span>,
    },
    {
      header: 'Stage',
      accessorKey: 'stage',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedLead(row)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="View Lead Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              title="Delete Sales Lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading sales pipeline..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Leads & Opportunity Pipeline"
        subtitle="Manage deal opportunities, follow-ups, lead qualification & value forecasting"
        icon={TrendingUp}
        action={
          <button
            onClick={() => navigate('/sales/leads/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Sales Lead
          </button>
        }
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search by lead #, company or contact..." />

      {/* Lead Details & Follow-up History Modal */}
      <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title={`Lead ${selectedLead?.leadNumber}`} size="lg">
        {selectedLead && (
          <div className="space-y-6 text-sm text-slate-300">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">{selectedLead.companyName}</h3>
                <p className="text-xs text-slate-400">Contact: {selectedLead.contactPerson} ({selectedLead.phone})</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedLead.stage} />
                <span className="font-bold text-emerald-400 text-base">₹{selectedLead.dealValue?.toLocaleString()}</span>
              </div>
            </div>

            {selectedLead.notes && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Requirement Notes</h4>
                <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">{selectedLead.notes}</p>
              </div>
            )}

            {/* Follow up log */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Follow-up History</h4>
              <div className="space-y-2">
                {selectedLead.followUps?.length > 0 ? (
                  selectedLead.followUps.map((f: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <p className="font-medium text-slate-200">{f.note}</p>
                      <p className="text-[10px] text-slate-500">By {f.createdBy} on {new Date(f.date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No follow-ups logged yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Sales Lead"
        message="Are you sure you want to permanently delete this sales lead from MongoDB Atlas?"
      />
    </div>
  );
};

export default LeadsListPage;
