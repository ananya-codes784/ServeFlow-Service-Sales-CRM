import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/hr');
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/hr/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteId(null);
    },
  });

  const columns = [
    {
      header: 'Employee ID',
      accessorKey: 'employeeId',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono">{info.getValue()}</span>,
    },
    {
      header: 'Full Name',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Department',
      accessorKey: 'department',
    },
    {
      header: 'Designation',
      accessorKey: 'designation',
      cell: (info: any) => <span className="text-slate-300 font-medium">{info.getValue()}</span>,
    },
    {
      header: 'Phone / Email',
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
      header: 'Base Salary',
      accessorKey: 'baseSalary',
      cell: (info: any) => <span className="font-bold text-emerald-400">₹{info.getValue()?.toLocaleString()}/mo</span>,
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
            title="Delete Employee Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading employee directory..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory & Field Engineers"
        subtitle="Manage company staff, technicians, departments & payroll info"
        icon={Building2}
        action={
          <button
            onClick={() => navigate('/hr/employees/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        }
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search by ID, name or department..." />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Employee Record"
        message="Are you sure you want to permanently delete this employee record from MongoDB Atlas?"
      />
    </div>
  );
};

export default EmployeeListPage;
