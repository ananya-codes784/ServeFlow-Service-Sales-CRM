import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import { Package, ArrowLeft, Save } from 'lucide-react';

const InventoryCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'SPARE_PART',
    quantity: 25,
    unitPrice: 120,
    reorderLevel: 10,
    vendorName: '',
    location: 'Main Warehouse',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/inventory', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      navigate('/inventory');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Add Inventory Item"
        subtitle="Create spare part, consumable or tool master record in warehouse catalog"
        icon={Package}
        action={
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Inventory
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">SKU Code *</label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="SKU-VALVE-90"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Item Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="High Pressure Valve Kit"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none bg-slate-900"
            >
              <option value="SPARE_PART">Spare Part</option>
              <option value="PRODUCT">Finished Product</option>
              <option value="CONSUMABLE">Consumable</option>
              <option value="TOOL">Tool & Equipment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Initial Stock Quantity *</label>
            <input
              type="number"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Unit Price ($) *</label>
            <input
              type="number"
              required
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Reorder Level Threshold</label>
            <input
              type="number"
              required
              value={formData.reorderLevel}
              onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Vendor Name *</label>
            <input
              type="text"
              required
              value={formData.vendorName}
              onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
              placeholder="HydraTech Dynamics"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Warehouse Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Main Warehouse - Shelf B4"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => navigate('/inventory')}
            className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20"
          >
            <Save className="w-4 h-4" /> Save Inventory Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventoryCreatePage;
