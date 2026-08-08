import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import DataTable from '../../components/DataTable';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { FileText, Plus, Printer, Download, Eye } from 'lucide-react';

const QuotationsPage: React.FC = () => {
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const res = await api.get('/sales/quotations');
      return res.data.data;
    },
  });

  const columns = [
    {
      header: 'Quotation #',
      accessorKey: 'quotationNumber',
      cell: (info: any) => <span className="font-bold text-brand-400">{info.getValue()}</span>,
    },
    {
      header: 'Customer / Lead Name',
      accessorKey: 'customerName',
      cell: (info: any) => <span className="font-semibold text-slate-100">{info.getValue()}</span>,
    },
    {
      header: 'Email',
      accessorKey: 'customerEmail',
    },
    {
      header: 'Total Amount',
      accessorKey: 'totalAmount',
      cell: (info: any) => <span className="font-bold text-emerald-400">${info.getValue()?.toLocaleString()}</span>,
    },
    {
      header: 'Valid Until',
      accessorKey: 'validUntil',
      cell: (info: any) => <span className="text-xs text-slate-300">{new Date(info.getValue()).toLocaleDateString()}</span>,
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
            onClick={() => setSelectedQuotation(row)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <Printer className="w-4 h-4" /> Print / View
          </button>
        );
      },
    },
  ];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading sales quotations..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Quotations & Proposals"
        subtitle="Generate, send & print official sales price quotations for leads"
        icon={FileText}
      />

      <DataTable data={data || []} columns={columns} searchPlaceholder="Search quotation number or customer..." />

      {/* Print View Modal */}
      <Modal isOpen={!!selectedQuotation} onClose={() => setSelectedQuotation(null)} title="Printable Sales Quotation" size="lg">
        {selectedQuotation && (
          <div id="printableQuotation" className="space-y-6 text-sm text-slate-300 p-4 border border-white/10 rounded-xl bg-slate-950">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">SERVEWELL CRM</h2>
                <p className="text-xs text-slate-400">Enterprise Solutions & Industrial Equipment</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-400 text-base">{selectedQuotation.quotationNumber}</p>
                <p className="text-xs text-slate-400">Date: {new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Quotation For:</p>
                <p className="font-bold text-white">{selectedQuotation.customerName}</p>
                <p className="text-xs text-slate-400">{selectedQuotation.customerEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase">Validity</p>
                <p className="font-medium text-slate-200">Valid until {new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
              </div>
            </div>

            <table className="w-full text-left text-xs text-slate-300 border border-white/10 rounded-lg overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectedQuotation.items?.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="p-3 text-white">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">${item.unitPrice?.toLocaleString()}</td>
                    <td className="p-3 text-right font-semibold text-emerald-400">${item.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-2">
              <div className="w-64 space-y-1.5 text-right text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-semibold text-slate-200">${selectedQuotation.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tax (18%):</span>
                  <span className="font-semibold text-slate-200">${selectedQuotation.taxAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-emerald-400">
                  <span>Grand Total:</span>
                  <span>${selectedQuotation.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs"
              >
                <Printer className="w-4 h-4" /> Print Quotation
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuotationsPage;
