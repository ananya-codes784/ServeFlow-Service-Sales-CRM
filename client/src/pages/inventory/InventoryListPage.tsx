import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Package, Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InventoryListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await api.get('/inventory');
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setDeleteId(null);
    },
  });

  const columns = [
    {
      header: 'SKU',
      accessorKey: 'sku',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono">{info.getValue()}</span>,
    },
    {
      header: 'Item Name',
      accessorKey: 'name',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Stock Quantity',
      accessorKey: 'quantity',
      cell: (info: any) => {
        const qty = info.getValue();
        const reorder = info.row.original.reorderLevel;
        const isLow = qty <= reorder;
        return (
          <div className="flex items-center gap-2">
            <span className={`font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>{qty}</span>
            {isLow && (
              <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" /> Reorder Needed
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Unit Price',
      accessorKey: 'unitPrice',
      cell: (info: any) => <span className="font-bold text-slate-200">₹{info.getValue()}</span>,
    },
    {
      header: 'Vendor Name',
      accessorKey: 'vendorName',
    },
    {
      header: 'Location',
      accessorKey: 'location',
      cell: (info: any) => <span className="text-xs text-slate-400">{info.getValue() || 'Warehouse'}</span>,
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <button
            onClick={() => setDeleteId(row._id)}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
            title="Delete Inventory Item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading spare parts & inventory stock..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Spare Parts Master"
        subtitle="Manage product master, spare parts stock levels, vendor records & reorder alerts"
        icon={Package}
        action={
          <button
            onClick={() => navigate('/inventory/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Inventory Item
          </button>
        }
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search SKU, item name or vendor..." />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Inventory Item"
        message="Are you sure you want to permanently delete this inventory item from MongoDB Atlas?"
      />
    </div>
  );
};

export default InventoryListPage;
