import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
  FileText, Plus, Download, CreditCard, Trash2, X, Save,
  Plus as PlusIcon, Minus, IndianRupee, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface LineItem {
  description: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

const defaultItem = (): LineItem => ({
  description: '',
  hsnCode: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 18,
  amount: 0,
});

const INR = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v || 0);

// ─── Component ────────────────────────────────────────────────────────────────
const InvoicesListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- Invoice form state ---
  const [customerId, setCustomerId] = useState('');
  const [relatedType, setRelatedType] = useState<'AMC' | 'SERVICE' | 'SALE'>('SERVICE');
  const [gstType, setGstType] = useState<'INTRA_STATE' | 'INTER_STATE'>('INTRA_STATE');
  const [items, setItems] = useState<LineItem[]>([defaultItem()]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // --- Payment form state ---
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'CHEQUE' | 'BANK_TRANSFER'>('CASH');
  const [payTxnId, setPayTxnId] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payNotes, setPayNotes] = useState('');

  // ─── Queries ────────────────────────────────────────────────────────────────
  const { data: invoices = [], isLoading } = useQuery<any[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await api.get('/finance/invoices?limit=100');
      return res.data.data;
    },
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await api.get('/customers');
      return res.data.data;
    },
  });

  const { data: revenueStats } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: async () => {
      const res = await api.get('/finance/revenue-stats');
      return res.data.data;
    },
  });

  // ─── Computed GST totals ────────────────────────────────────────────────────
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.amount, 0), [items]);
  const cgst = useMemo(() => gstType === 'INTRA_STATE' ? items.reduce((s, it) => s + (it.amount * it.taxRate) / 100 / 2, 0) : 0, [items, gstType]);
  const sgst = useMemo(() => gstType === 'INTRA_STATE' ? items.reduce((s, it) => s + (it.amount * it.taxRate) / 100 / 2, 0) : 0, [items, gstType]);
  const igst = useMemo(() => gstType === 'INTER_STATE' ? items.reduce((s, it) => s + (it.amount * it.taxRate) / 100, 0) : 0, [items, gstType]);
  const taxAmount = gstType === 'INTRA_STATE' ? cgst + sgst : igst;
  const grandTotal = subtotal + taxAmount;

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post('/finance/invoices', { customerId, relatedType, gstType, items, dueDate, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      resetForm();
      setIsCreateOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/finance/invoices/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      setDeleteId(null);
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/finance/invoices/${paymentModal._id}/payment`, {
        amount: payAmount,
        paymentMethod: payMethod,
        transactionId: payTxnId,
        notes: payNotes,
        paymentDate: payDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-stats'] });
      setPaymentModal(null);
    },
  });

  const resetForm = () => {
    setCustomerId('');
    setRelatedType('SERVICE');
    setGstType('INTRA_STATE');
    setItems([defaultItem()]);
    setDueDate('');
    setNotes('');
  };

  // ─── Item management ────────────────────────────────────────────────────────
  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      const qty = field === 'quantity' ? Number(value) : Number(next[idx].quantity);
      const price = field === 'unitPrice' ? Number(value) : Number(next[idx].unitPrice);
      next[idx].amount = Math.round(qty * price * 100) / 100;
      return next;
    });
  };

  const downloadPDF = async (id: string, invoiceNum: string) => {
    try {
      const res = await api.get(`/finance/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) { console.error('PDF download failed', e); }
  };

  // ─── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      cell: (info: any) => <span className="font-bold text-violet-400 font-mono text-xs">{info.getValue()}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Type',
      accessorKey: 'relatedType',
      cell: (info: any) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {info.getValue()}
        </span>
      ),
    },
    {
      header: 'GST Type',
      accessorKey: 'gstType',
      cell: (info: any) => (
        <span className="text-xs text-slate-400">
          {info.getValue() === 'INTER_STATE' ? 'IGST' : 'CGST+SGST'}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      cell: (info: any) => <span className="font-bold text-slate-100">{INR(info.getValue())}</span>,
    },
    {
      header: 'Paid',
      accessorKey: 'paidAmount',
      cell: (info: any) => <span className="font-semibold text-emerald-400">{INR(info.getValue())}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'paymentStatus',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      cell: (info: any) => (
        <span className="text-xs text-slate-400">
          {new Date(info.getValue()).toLocaleDateString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => downloadPDF(row._id, row.invoiceNumber)}
              className="px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 font-medium text-xs flex items-center gap-1 transition"
              title="Download GST Invoice PDF"
            >
              <Download className="w-3.5 h-3.5" /> PDF
            </button>
            {row.paymentStatus !== 'PAID' && (
              <button
                onClick={() => {
                  setPaymentModal(row);
                  setPayAmount(Math.round((row.totalAmount - row.paidAmount) * 100) / 100);
                  setPayDate(new Date().toISOString().split('T')[0]);
                }}
                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-xs flex items-center gap-1 transition"
                title="Record Payment"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay
              </button>
            )}
            <button
              onClick={() => setDeleteId(row._id)}
              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
              title="Delete Invoice"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading invoices & billing records..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices & GST Billing"
        subtitle="Create GST invoices, record payments, download PDF receipts & track billing status"
        icon={FileText}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Create GST Invoice
          </button>
        }
      />

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed', value: INR(revenueStats?.totalRevenue + revenueStats?.outstandingBalance || 0), icon: FileText, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Total Collected', value: INR(revenueStats?.totalRevenue || 0), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Outstanding Balance', value: INR(revenueStats?.outstandingBalance || 0), icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Total Invoices', value: String(revenueStats?.totalInvoices || 0), icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map((card) => (
          <div key={card.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{card.label}</p>
              <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable data={invoices} columns={columns} searchPlaceholder="Search invoice number or customer..." />

      {/* ── CREATE GST INVOICE MODAL ─────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-400" />
                Create GST Invoice
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Row 1: Customer + Type + GST Type */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Customer *</label>
                  <select
                    required
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="">— Select Customer —</option>
                    {customers.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Invoice Type</label>
                  <select
                    value={relatedType}
                    onChange={(e) => setRelatedType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="SERVICE">Service / Breakdown</option>
                    <option value="AMC">AMC Contract</option>
                    <option value="SALE">Product Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">GST Type</label>
                  <select
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  >
                    <option value="INTRA_STATE">Intra-State (CGST 9% + SGST 9%)</option>
                    <option value="INTER_STATE">Inter-State (IGST 18%)</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">Line Items</h4>
                  <button
                    type="button"
                    onClick={() => setItems(prev => [...prev, defaultItem()])}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 text-xs font-medium transition"
                  >
                    <PlusIcon className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-slate-400">
                        <th className="px-2 py-2 text-left">Description *</th>
                        <th className="px-2 py-2 text-left w-20">HSN Code</th>
                        <th className="px-2 py-2 text-center w-14">Qty</th>
                        <th className="px-2 py-2 text-right w-24">Unit Price (₹)</th>
                        <th className="px-2 py-2 text-center w-20">Tax Rate</th>
                        <th className="px-2 py-2 text-right w-24">Amount (₹)</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((item, idx) => (
                        <tr key={idx} className="bg-slate-950">
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Annual Maintenance Service"
                              value={item.description}
                              onChange={(e) => updateItem(idx, 'description', e.target.value)}
                              className="w-full bg-transparent text-white focus:outline-none placeholder-slate-600 text-xs"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="text"
                              placeholder="8415"
                              value={item.hsnCode}
                              onChange={(e) => updateItem(idx, 'hsnCode', e.target.value)}
                              className="w-full bg-transparent text-white focus:outline-none placeholder-slate-600 text-xs font-mono"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                              className="w-full bg-transparent text-white text-center focus:outline-none text-xs"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unitPrice}
                              onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                              className="w-full bg-transparent text-white text-right focus:outline-none text-xs"
                            />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <select
                              value={item.taxRate}
                              onChange={(e) => updateItem(idx, 'taxRate', Number(e.target.value))}
                              className="bg-slate-800 text-white rounded-lg px-1 py-0.5 text-xs focus:outline-none"
                            >
                              <option value={0}>0% (Exempt)</option>
                              <option value={5}>5% GST</option>
                              <option value={12}>12% GST</option>
                              <option value={18}>18% GST</option>
                              <option value={28}>28% GST</option>
                            </select>
                          </td>
                          <td className="px-2 py-1.5 text-right font-semibold text-violet-300">
                            ₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-1.5">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                                className="text-rose-400 hover:text-rose-300 transition"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GST Summary Box */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal (Taxable Value)</span>
                    <span className="text-slate-200 font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {gstType === 'INTRA_STATE' ? (
                    <>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>CGST (9%)</span>
                        <span className="text-slate-200">₹{cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>SGST (9%)</span>
                        <span className="text-slate-200">₹{sgst.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>IGST (18%)</span>
                      <span className="text-slate-200">₹{igst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-2 flex justify-between">
                    <span className="text-sm font-bold text-white">Grand Total</span>
                    <span className="text-lg font-bold text-violet-400">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Due Date + Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Payment terms, warranty info, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!customerId || !dueDate || items.some(i => !i.description)) return;
                    createMutation.mutate();
                  }}
                  disabled={createMutation.isPending || !customerId || !dueDate}
                  className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40 shadow-lg shadow-violet-600/20"
                >
                  <Save className="w-4 h-4" />
                  {createMutation.isPending ? 'Saving...' : 'Save GST Invoice'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RECORD PAYMENT MODAL ─────────────────────────────────────────────── */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Record Payment
              </h3>
              <button onClick={() => setPaymentModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Invoice summary */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Invoice</span>
                <span className="text-violet-400 font-bold font-mono">{paymentModal.invoiceNumber}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Customer</span>
                <span className="text-white font-semibold">{paymentModal.customerName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-white font-bold">{INR(paymentModal.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Already Paid</span>
                <span className="text-emerald-400 font-bold">{INR(paymentModal.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-700 pt-1 mt-1">
                <span className="text-slate-400 font-semibold">Balance Due</span>
                <span className="text-rose-400 font-bold text-sm">{INR(paymentModal.totalAmount - paymentModal.paidAmount)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Amount Received (₹) *</label>
                <input
                  type="number"
                  min={1}
                  max={paymentModal.totalAmount - paymentModal.paidAmount}
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Payment Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        payMethod === m
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {m === 'BANK_TRANSFER' ? 'Bank' : m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Txn Reference / Cheque #</label>
                  <input
                    type="text"
                    placeholder="UPI ref / Cheque no."
                    value={payTxnId}
                    onChange={(e) => setPayTxnId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="Optional notes"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPaymentModal(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => paymentMutation.mutate()}
                disabled={paymentMutation.isPending || payAmount <= 0}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40 shadow-lg shadow-emerald-600/20"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                {paymentMutation.isPending ? 'Saving...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Invoice"
        message="Are you sure? This will permanently delete the invoice from the billing records."
      />
    </div>
  );
};

export default InvoicesListPage;
