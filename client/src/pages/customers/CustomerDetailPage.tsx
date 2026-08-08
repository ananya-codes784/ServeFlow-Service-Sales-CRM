import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Wrench,
  Clock,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Package,
  RefreshCw,
  X,
  CreditCard,
  Briefcase,
} from 'lucide-react';

interface InstalledProduct {
  _id?: string;
  productName: string;
  serialNumber: string;
  installationDate: string;
  warrantyEnd: string;
  modelNumber?: string;
}

interface Customer360Data {
  customer: {
    _id: string;
    customerCode: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string;
    category: 'VIP' | 'REGULAR' | 'ENTERPRISE' | 'GOVERNMENT';
    installedProducts: InstalledProduct[];
    notes?: string;
    createdAt: string;
  };
  complaints: any[];
  amcContracts: any[];
  serviceTickets: any[];
  invoices: any[];
}

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'complaints' | 'amc' | 'services' | 'invoices'>('overview');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    serialNumber: '',
    modelNumber: '',
    installationDate: new Date().toISOString().split('T')[0],
    warrantyEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const { data, isLoading, isError, refetch } = useQuery<Customer360Data>({
    queryKey: ['customer360', id],
    queryFn: async () => {
      const res = await api.get(`/customers/${id}/full`);
      return res.data.data;
    },
    enabled: !!id,
  });

  const addProductMutation = useMutation({
    mutationFn: async (payload: typeof newProduct) => {
      const res = await api.post(`/customers/${id}/products`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer360', id] });
      setIsAddProductOpen(false);
      setNewProduct({
        productName: '',
        serialNumber: '',
        modelNumber: '',
        installationDate: new Date().toISOString().split('T')[0],
        warrantyEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.delete(`/customers/${id}/products/${productId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer360', id] });
    },
  });

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.productName || !newProduct.serialNumber) return;
    addProductMutation.mutate(newProduct);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500 mr-3" />
        <span>Loading Customer 360 View...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Customer Not Found</h3>
        <p className="text-slate-400 mb-6">Could not load customer 360-degree data.</p>
        <button
          onClick={() => navigate('/customers')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
        >
          Back to Customer List
        </button>
      </div>
    );
  }

  const { customer, complaints = [], amcContracts = [], serviceTickets = [], invoices = [] } = data;

  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  const getWarrantyStatus = (warrantyEnd: string) => {
    const end = new Date(warrantyEnd).getTime();
    const now = new Date().getTime();
    const daysLeft = Math.ceil((end - now) / (1000 * 3600 * 24));
    if (daysLeft < 0) {
      return { label: 'Expired', class: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
    } else if (daysLeft <= 30) {
      return { label: `Expires in ${daysLeft} days`, class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { label: 'Active Warranty', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/customers')}
          className="flex items-center text-sm font-medium text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Customers
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/20">
              {customer.companyName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {customer.companyName}
                </h1>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {customer.customerCode}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                    customer.category === 'VIP'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : customer.category === 'ENTERPRISE'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : customer.category === 'GOVERNMENT'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {customer.category}
                </span>
              </div>
              <p className="text-slate-400 mt-1 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Contact: <span className="text-slate-200">{customer.contactPerson}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-xs text-slate-500 block">Installed Assets</span>
              <span className="text-lg font-bold text-white">{customer.installedProducts?.length || 0}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Complaints</span>
              <span className="text-lg font-bold text-amber-400">{complaints.length}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">AMC Status</span>
              <span className="text-lg font-bold text-emerald-400">
                {amcContracts.filter((c) => c.status === 'ACTIVE').length} Active
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Outstanding</span>
              <span className="text-lg font-bold text-rose-400">₹{totalOutstanding.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-2">
        {[
          { id: 'overview', label: '360° Overview', icon: Building2 },
          { id: 'products', label: `Assets / Products (${customer.installedProducts?.length || 0})`, icon: Package },
          { id: 'complaints', label: `Complaints (${complaints.length})`, icon: AlertTriangle },
          { id: 'amc', label: `AMC Contracts (${amcContracts.length})`, icon: ShieldCheck },
          { id: 'services', label: `Service Jobs (${serviceTickets.length})`, icon: Wrench },
          { id: 'invoices', label: `Invoices (${invoices.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                isActive
                  ? 'border-cyan-500 text-cyan-400 bg-slate-900/50'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info Card */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              Company Details & Contact Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs block mb-1">Company Name</span>
                <span className="text-white font-medium">{customer.companyName}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs block mb-1">GST Number</span>
                <span className="text-cyan-400 font-mono font-medium">{customer.gstNumber || 'N/A'}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-slate-500 text-xs block">Email Address</span>
                  <a href={`mailto:${customer.email}`} className="text-white hover:text-cyan-400 transition">
                    {customer.email}
                  </a>
                </div>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="text-slate-500 text-xs block">Phone Number</span>
                  <a href={`tel:${customer.phone}`} className="text-white hover:text-cyan-400 transition">
                    {customer.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-1 shrink-0" />
              <div>
                <span className="text-slate-500 text-xs block mb-1">Full Service Address</span>
                <p className="text-slate-200">
                  {customer.address}, {customer.city}, {customer.state} - {customer.pincode}
                </p>
              </div>
            </div>

            {customer.notes && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-xs block mb-1">Special Notes</span>
                <p className="text-slate-300 text-sm italic">{customer.notes}</p>
              </div>
            )}
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Financial Overview
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Billed</span>
                  <span className="text-white font-medium">₹{totalInvoiced.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Collected</span>
                  <span className="text-emerald-400 font-medium">₹{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Balance Due</span>
                  <span className="text-rose-400 font-bold">₹{totalOutstanding.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" />
                Contract & Health Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Active AMC</span>
                  <span className="text-white font-medium">
                    {amcContracts.some((a) => a.status === 'ACTIVE') ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Protected
                      </span>
                    ) : (
                      <span className="text-slate-500">No Active AMC</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Open Complaints</span>
                  <span className="text-amber-400 font-bold">
                    {complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Product Information Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Customer Installed Products / Assets</h2>
              <p className="text-slate-400 text-sm">
                Track all equipment, serial numbers, models, and warranty expiration dates.
              </p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" />
              Add Installed Product
            </button>
          </div>

          {customer.installedProducts && customer.installedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customer.installedProducts.map((product, idx) => {
                const status = getWarrantyStatus(product.warrantyEnd);
                return (
                  <div
                    key={product._id || idx}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 relative group transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{product.productName}</h3>
                          <span className="text-xs text-slate-400 font-mono">
                            SN: {product.serialNumber}
                          </span>
                        </div>
                      </div>
                      {product._id && (
                        <button
                          onClick={() => deleteProductMutation.mutate(product._id!)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      {product.modelNumber && (
                        <div className="flex justify-between text-slate-400">
                          <span>Model Number:</span>
                          <span className="text-slate-200 font-medium">{product.modelNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>Installation Date:</span>
                        <span className="text-slate-200 font-medium">
                          {new Date(product.installationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Warranty End Date:</span>
                        <span className="text-slate-200 font-medium">
                          {new Date(product.warrantyEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white">No Installed Products Registered</h3>
              <p className="text-slate-400 text-sm mt-1 mb-4">
                Add products and serial numbers to manage warranty and service history.
              </p>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-sm font-medium transition"
              >
                + Register First Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Complaints History Tab */}
      {activeTab === 'complaints' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white">Customer Service Complaints</h2>
            <button
              onClick={() => navigate('/complaints/create')}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition"
            >
              + Raise New Ticket
            </button>
          </div>
          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Ticket #</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned Tech</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {complaints.map((c: any) => (
                    <tr key={c._id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-medium text-cyan-400">{c.ticketNumber}</td>
                      <td className="p-4">{c.productName}</td>
                      <td className="p-4 font-medium text-white">{c.subject}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            c.priority === 'HIGH' || c.priority === 'URGENT'
                              ? 'bg-rose-500/10 text-rose-400'
                              : 'bg-blue-500/10 text-blue-400'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{c.assignedTechnicianName || 'Unassigned'}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No complaints logged for this customer.</div>
          )}
        </div>
      )}

      {/* AMC Contracts Tab */}
      {activeTab === 'amc' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white">AMC Contracts History</h2>
            <button
              onClick={() => navigate('/amc/create')}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition"
            >
              + Create AMC Contract
            </button>
          </div>
          {amcContracts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Contract #</th>
                    <th className="p-4">Plan Name</th>
                    <th className="p-4">Contract Period</th>
                    <th className="p-4">Value</th>
                    <th className="p-4">Visits</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {amcContracts.map((amc: any) => (
                    <tr key={amc._id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-medium text-cyan-400">{amc.contractNumber}</td>
                      <td className="p-4 text-white font-medium">{amc.planName}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(amc.startDate).toLocaleDateString()} -{' '}
                        {new Date(amc.endDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">₹{amc.contractValue?.toLocaleString()}</td>
                      <td className="p-4 text-slate-300">
                        {amc.visitsCompleted} / {amc.visitsPerYear} Completed
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            amc.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {amc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No AMC contracts found.</div>
          )}
        </div>
      )}

      {/* Service Tickets Tab */}
      {activeTab === 'services' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white">Service & Repair Jobs</h2>
            <button
              onClick={() => navigate('/services/create')}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition"
            >
              + Create Service Ticket
            </button>
          </div>
          {serviceTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Service #</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Scheduled Date</th>
                    <th className="p-4">Technician</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {serviceTickets.map((s: any) => (
                    <tr key={s._id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-medium text-cyan-400">{s.serviceNumber}</td>
                      <td className="p-4 font-medium text-white">{s.serviceType}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(s.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-slate-300">{s.technicianName || 'Unassigned'}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No service tickets recorded.</div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white">Billing & Invoices</h2>
          </div>
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Paid Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((inv: any) => (
                    <tr key={inv._id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-mono font-medium text-cyan-400">{inv.invoiceNumber}</td>
                      <td className="p-4 text-xs font-semibold text-slate-300">{inv.relatedType}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-semibold text-white">₹{inv.totalAmount?.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-emerald-400">₹{inv.paidAmount?.toLocaleString()}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            inv.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : inv.paymentStatus === 'PARTIAL'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No invoices issued for this customer.</div>
          )}
        </div>
      )}

      {/* Modal: Add Installed Product */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-cyan-400" />
                Register Installed Product / Asset
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial RO Water Purifier 100 LPH"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SN-998823"
                    value={newProduct.serialNumber}
                    onChange={(e) => setNewProduct({ ...newProduct, serialNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MOD-2026-X"
                    value={newProduct.modelNumber}
                    onChange={(e) => setNewProduct({ ...newProduct, modelNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Installation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newProduct.installationDate}
                    onChange={(e) => setNewProduct({ ...newProduct, installationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                    Warranty End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newProduct.warrantyEnd}
                    onChange={(e) => setNewProduct({ ...newProduct, warrantyEnd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addProductMutation.isPending}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {addProductMutation.isPending ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailPage;
