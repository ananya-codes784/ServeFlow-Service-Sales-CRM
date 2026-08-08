import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { CreditCard, Download, Banknote, Smartphone, Building2, FileCheck } from 'lucide-react';

const METHOD_ICONS: Record<string, React.ReactNode> = {
  CASH: <Banknote className="w-3.5 h-3.5" />,
  UPI: <Smartphone className="w-3.5 h-3.5" />,
  BANK_TRANSFER: <Building2 className="w-3.5 h-3.5" />,
  CHEQUE: <FileCheck className="w-3.5 h-3.5" />,
  CREDIT_CARD: <CreditCard className="w-3.5 h-3.5" />,
};

const METHOD_COLORS: Record<string, string> = {
  CASH: 'bg-amber-500/10 text-amber-400',
  UPI: 'bg-cyan-500/10 text-cyan-400',
  BANK_TRANSFER: 'bg-blue-500/10 text-blue-400',
  CHEQUE: 'bg-purple-500/10 text-purple-400',
  CREDIT_CARD: 'bg-rose-500/10 text-rose-400',
};

const INR = (v: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v || 0);

const PaymentsListPage: React.FC = () => {
  const { data: payments = [], isLoading } = useQuery<any[]>({
    queryKey: ['payments'],
    queryFn: async () => {
      const res = await api.get('/finance/payments');
      return res.data.data;
    },
  });

  const totalCollected = payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);

  const downloadReceipt = async (id: string, ref: string) => {
    try {
      const res = await api.get(`/finance/payments/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${ref}-receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) { console.error('Receipt download failed', e); }
  };

  const columns = [
    {
      header: 'Payment Ref #',
      accessorKey: 'paymentReference',
      cell: (info: any) => (
        <span className="font-bold text-emerald-400 font-mono text-xs">{info.getValue()}</span>
      ),
    },
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      cell: (info: any) => (
        <span className="font-semibold text-violet-400 text-xs">{info.getValue()}</span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerName',
      cell: (info: any) => (
        <span className="font-semibold text-slate-100">{info.getValue()}</span>
      ),
    },
    {
      header: 'Amount Received',
      accessorKey: 'amount',
      cell: (info: any) => (
        <span className="font-bold text-emerald-400 text-sm">{INR(info.getValue())}</span>
      ),
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
      cell: (info: any) => {
        const method = info.getValue() || 'CASH';
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${METHOD_COLORS[method] || 'bg-slate-800 text-slate-300'}`}>
            {METHOD_ICONS[method]}
            {method.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Txn Reference',
      accessorKey: 'transactionId',
      cell: (info: any) => (
        <span className="text-xs text-slate-400 font-mono">{info.getValue() || 'N/A'}</span>
      ),
    },
    {
      header: 'Payment Date',
      accessorKey: 'paymentDate',
      cell: (info: any) => (
        <span className="text-xs text-slate-300">
          {new Date(info.getValue()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Receipt',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <button
            onClick={() => downloadReceipt(row._id, row.paymentReference)}
            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-xs flex items-center gap-1 transition"
            title="Download Payment Receipt PDF"
          >
            <Download className="w-3.5 h-3.5" /> Receipt
          </button>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading payment transactions..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Collections Ledger"
        subtitle="Real-time audit log of all customer payments, bank receipts & downloadable payment receipts"
        icon={CreditCard}
      />

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-800/40 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">Total Collections</p>
          <p className="text-3xl font-bold text-white">{INR(totalCollected)}</p>
          <p className="text-xs text-slate-400 mt-1">{payments.length} payment transactions recorded</p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <CreditCard className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      <DataTable data={payments} columns={columns} searchPlaceholder="Search payment ref, invoice or customer..." />
    </div>
  );
};

export default PaymentsListPage;
