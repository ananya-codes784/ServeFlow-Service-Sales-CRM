import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Wrench, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['service-tickets'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-tickets'] });
      setDeleteId(null);
    },
  });

  const columns = [
    {
      header: 'Service #',
      accessorKey: 'serviceNumber',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono">{info.getValue()}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Service Type',
      accessorKey: 'serviceType',
      cell: (info: any) => <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">{info.getValue()}</span>,
    },
    {
      header: 'Scheduled Date',
      accessorKey: 'scheduledDate',
      cell: (info: any) => <span className="text-xs text-slate-300">{new Date(info.getValue()).toLocaleDateString()}</span>,
    },
    {
      header: 'Assigned Tech',
      accessorKey: 'technicianName',
      cell: (info: any) => <span className="text-slate-300">{info.getValue() || 'Unassigned'}</span>,
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
          <button
            onClick={() => setDeleteId(row._id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
            title="Delete Service Ticket"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading scheduled service calls..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduled Service Calls"
        subtitle="Manage preventive maintenance visits, technician routing & inspection checklists"
        icon={Wrench}
        action={
          <button
            onClick={() => navigate('/services/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Service Call
          </button>
        }
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search service number or customer..." />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Scheduled Service Ticket"
        message="Are you sure you want to permanently delete this service call from MongoDB Atlas?"
      />
    </div>
  );
};

export default ServiceListPage;
