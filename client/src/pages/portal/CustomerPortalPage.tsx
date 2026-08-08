import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Globe, Plus, AlertCircle, FileText, Download, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CustomerPortalPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: complaints } = useQuery({
    queryKey: ['portal-complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    },
  });

  const { data: amc } = useQuery({
    queryKey: ['portal-amc'],
    queryFn: async () => {
      const res = await api.get('/amc');
      return res.data.data;
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Customer Self-Service Portal"
        subtitle="Track active service tickets, view AMC validity, raise instant complaints & download billing"
        icon={Globe}
        action={
          <button
            onClick={() => navigate('/complaints/create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Raise Breakdown Ticket
          </button>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Active AMC Cover</h3>
              <p className="text-xs text-slate-400">Gold Enterprise Shield (4 Vis/Yr)</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
            <span className="text-slate-400">Visits Remaining: <strong className="text-emerald-400">2 Visits</strong></span>
            <span className="text-slate-400">Valid till: <strong className="text-white">Dec 31, 2026</strong></span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Open Service Tickets</h3>
              <p className="text-xs text-slate-400">Active breakdown requests in progress</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
            <span className="text-slate-400">Total Open: <strong className="text-amber-400">1 Ticket</strong></span>
            <span className="text-slate-400">Technician: <strong className="text-white">Alex Rivera</strong></span>
          </div>
        </div>
      </div>

      {/* Ticket Tracking */}
      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
        <h3 className="font-bold text-slate-100 text-base">Your Breakdown Service Tickets</h3>
        <div className="space-y-3">
          {complaints?.map((ticket: any) => (
            <div key={ticket._id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-brand-400 text-xs">{ticket.ticketNumber}</span>
                  <StatusBadge status={ticket.priority} />
                </div>
                <h4 className="font-bold text-white text-sm">{ticket.subject}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{ticket.productName} • SN: {ticket.serialNumber || 'N/A'}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalPage;
