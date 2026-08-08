import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import {
  Boxes,
  Plus,
  AlertTriangle,
  MapPin,
  Tag,
  DollarSign,
  Edit3,
  Trash2,
  X,
  Layers,
  Building,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ProductMasterItem {
  _id: string;
  productCode: string;
  brand: string;
  modelNumber: string;
  name: string;
  category: 'AIR_CONDITIONER' | 'WATER_PURIFIER' | 'UPS_INVERTER' | 'SOLAR_PANEL' | 'COMMERCIAL_EQUIPMENT' | 'SPARE_PARTS';
  capacity?: string;
  baseMrp: number;
  sellingPrice: number;
  hsnCode?: string;
  warehouseLocation: string;
  shelfBinLocation?: string;
  reorderLevel: number;
  stockQuantity: number;
  description?: string;
  createdAt: string;
}

const ProductMasterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'ALL' | 'LOW_STOCK' | 'AC' | 'RO' | 'POWER'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductMasterItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand: '',
    modelNumber: '',
    name: '',
    category: 'AIR_CONDITIONER',
    capacity: '',
    baseMrp: '',
    sellingPrice: '',
    hsnCode: '8415',
    warehouseLocation: 'Main Warehouse',
    shelfBinLocation: 'Rack A-1',
    reorderLevel: '5',
    stockQuantity: '10',
    description: '',
  });

  const { data: products = [], isLoading, refetch } = useQuery<ProductMasterItem[]>({
    queryKey: ['products-master'],
    queryFn: async () => {
      const res = await api.get('/products-master');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/products-master', {
        ...formData,
        baseMrp: Number(formData.baseMrp || formData.sellingPrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderLevel: Number(formData.reorderLevel),
        stockQuantity: Number(formData.stockQuantity),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-master'] });
      setIsAddModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingProduct) return;
      const res = await api.put(`/products-master/${editingProduct._id}`, editingProduct);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-master'] });
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/products-master/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-master'] });
      setDeleteId(null);
    },
  });

  const resetForm = () => {
    setFormData({
      brand: '',
      modelNumber: '',
      name: '',
      category: 'AIR_CONDITIONER',
      capacity: '',
      baseMrp: '',
      sellingPrice: '',
      hsnCode: '8415',
      warehouseLocation: 'Main Warehouse',
      shelfBinLocation: 'Rack A-1',
      reorderLevel: '5',
      stockQuantity: '10',
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const lowStockItems = products.filter((p) => p.stockQuantity <= p.reorderLevel);
  const totalValuation = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0);
  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand))).length;

  const filteredProducts = products.filter((p) => {
    if (filterTab === 'LOW_STOCK') return p.stockQuantity <= p.reorderLevel;
    if (filterTab === 'AC') return p.category === 'AIR_CONDITIONER';
    if (filterTab === 'RO') return p.category === 'WATER_PURIFIER';
    if (filterTab === 'POWER') return p.category === 'UPS_INVERTER' || p.category === 'SOLAR_PANEL';
    return true;
  });

  const columns = [
    {
      header: 'Product Code',
      accessorKey: 'productCode',
      cell: (info: any) => <span className="font-bold text-cyan-400 font-mono text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Brand & Model',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-800 text-cyan-300 uppercase tracking-wider">
                {row.brand}
              </span>
              <span className="text-white font-semibold text-xs font-mono">{row.modelNumber}</span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1">{row.name}</p>
          </div>
        );
      },
    },
    {
      header: 'Capacity / HSN',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="text-xs">
            <span className="text-white font-medium block">{row.capacity || 'N/A'}</span>
            <span className="text-slate-500 font-mono text-[11px]">HSN: {row.hsnCode || '8415'}</span>
          </div>
        );
      },
    },
    {
      header: 'Warehouse & Shelf',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="text-xs space-y-0.5">
            <p className="text-slate-200 font-medium flex items-center gap-1">
              <Building className="w-3 h-3 text-cyan-400 shrink-0" /> {row.warehouseLocation}
            </p>
            <p className="text-slate-400 flex items-center gap-1 text-[11px]">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" /> Shelf: {row.shelfBinLocation || 'Unassigned'}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Pricing (MRP / Selling)',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="text-xs">
            <span className="text-emerald-400 font-bold block">₹{row.sellingPrice?.toLocaleString()}</span>
            <span className="text-slate-500 line-through text-[11px]">MRP: ₹{row.baseMrp?.toLocaleString()}</span>
          </div>
        );
      },
    },
    {
      header: 'Stock & Reorder Status',
      cell: (info: any) => {
        const row = info.row.original;
        const isLow = row.stockQuantity <= row.reorderLevel;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs ${isLow ? 'text-rose-400' : 'text-slate-200'}`}>
                {row.stockQuantity} Units
              </span>
              <span className="text-[10px] text-slate-500">(Min: {row.reorderLevel})</span>
            </div>
            {isLow ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" /> Reorder Alert
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Optimal Stock
              </span>
            )}
          </div>
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
              onClick={() => setEditingProduct(row)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
              title="Edit Product Details & Stock"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
              title="Delete from Catalog"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading product master catalog..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centralized Product Master Catalog"
        subtitle="Manage appliance & equipment models, brand pricing, capacity specifications, multi-warehouse shelf locations & low stock alerts"
        icon={Boxes}
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Product to Catalog
          </button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Total Product Models</span>
            <span className="text-2xl font-bold text-white mt-1 block">{products.length}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Low Stock Reorder Alerts</span>
            <span className="text-2xl font-bold text-rose-400 mt-1 block">{lowStockItems.length}</span>
            <span className="text-[10px] text-slate-500">Need stock replenishment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Warehouse Stock Valuation</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">₹{totalValuation.toLocaleString()}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Manufacturer Brands</span>
            <span className="text-2xl font-bold text-purple-400 mt-1 block">{uniqueBrands}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Triage Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: `All Products Catalog (${products.length})` },
          { id: 'LOW_STOCK', label: `Low Stock Reorder Queue (${lowStockItems.length})`, badge: lowStockItems.length > 0 },
          { id: 'AC', label: 'Air Conditioners' },
          { id: 'RO', label: 'Water Purifiers / RO' },
          { id: 'POWER', label: 'Inverters & Solar' },
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
            {tab.badge && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
          </button>
        ))}
      </div>

      <DataTable data={filteredProducts} columns={columns} searchPlaceholder="Search by model, brand, product code or name..." />

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />
                Add Product to Master Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Voltas / Daikin / Kent"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Model Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SAC-183V / RO-100LPH"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Product Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1.5 Ton 3 Star Inverter Split AC"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="AIR_CONDITIONER">Air Conditioner (HVAC)</option>
                    <option value="WATER_PURIFIER">Water Purifier (RO)</option>
                    <option value="UPS_INVERTER">UPS / Inverter</option>
                    <option value="SOLAR_PANEL">Solar System</option>
                    <option value="COMMERCIAL_EQUIPMENT">Commercial Equipment</option>
                    <option value="SPARE_PARTS">Spare Parts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Capacity / Specification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1.5 Ton / 100 LPH / 10 KVA"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Base MRP (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={formData.baseMrp}
                    onChange={(e) => setFormData({ ...formData, baseMrp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 38500"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-bold text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    GST HSN Code
                  </label>
                  <input
                    type="text"
                    placeholder="8415"
                    value={formData.hsnCode}
                    onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Warehouse Location *
                  </label>
                  <select
                    value={formData.warehouseLocation}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Main Warehouse">Main Warehouse</option>
                    <option value="North Regional Hub">North Regional Hub</option>
                    <option value="South Service Depot">South Service Depot</option>
                    <option value="Transit Store">Transit Store</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Shelf / Bin Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A-3, Bin 12"
                    value={formData.shelfBinLocation}
                    onChange={(e) => setFormData({ ...formData, shelfBinLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Initial Physical Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Reorder Safety Level *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-bold text-rose-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Product Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Update {editingProduct.productCode}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={editingProduct.sellingPrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold text-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={editingProduct.reorderLevel}
                    onChange={(e) => setEditingProduct({ ...editingProduct, reorderLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold text-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Shelf / Bin Location</label>
                <input
                  type="text"
                  value={editingProduct.shelfBinLocation || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shelfBinLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
              >
                {updateMutation.isPending ? 'Updating...' : 'Save Updates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Delete Product from Catalog?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to permanently delete this product model from your master catalog in MongoDB Atlas?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMasterPage;
