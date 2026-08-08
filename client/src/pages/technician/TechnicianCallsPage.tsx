import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { HardHat, MapPin, CheckCircle2, Clock, Navigation, Wrench, UserCheck, CheckSquare, Phone } from 'lucide-react';

const TechnicianCallsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    },
  });

  const updateCallStatusMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { id: string; status: string; comment?: string }) => {
      const res = await api.put(`/complaints/${id}`, {
        status,
        statusComment: comment || `Status updated to ${status} by field technician.`,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['serviceTickets'] });
      setSelectedTicket(null);
      setResolutionNotes('');
    },
  });

  const filteredTickets = tickets.filter((t: any) => {
    if (filterTab === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED';
    if (filterTab === 'RESOLVED') return t.status === 'RESOLVED' || t.status === 'CLOSED';
    return true;
  });

  if (isLoading) return <LoadingSpinner size="lg" text="Loading field technician call sheet..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Technician Dispatch & Call Sheet"
        subtitle="View allocated breakdown calls, navigate to customer sites, update service checklists & sign-off"
        icon={HardHat}
      />

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { id: 'ALL', label: `All Allocated Calls (${tickets.length})` },
          { id: 'IN_PROGRESS', label: 'Active & In Progress Calls' },
          { id: 'RESOLVED', label: 'Completed Visits' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              filterTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTickets.map((ticket: any) => (
            <div
              key={ticket._id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400 font-mono text-sm">{ticket.ticketNumber}</span>
                  <StatusBadge status={ticket.priority} />
                </div>

                <div>
                  <h3 className="font-bold text-white text-base leading-tight mb-1">{ticket.subject}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    Customer: <span className="text-slate-200 font-medium">{ticket.customerName}</span>
                  </p>
                  {ticket.contactPhone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" /> {ticket.contactPhone}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-medium text-slate-200">Product: {ticket.productName}</p>
                  <p className="text-slate-400 line-clamp-2">{ticket.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Allocated Engineer:</span>
                  <span className="text-emerald-400 font-medium">{ticket.assignedTechnicianName || 'Unassigned'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={ticket.status} />
                  <button
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Start Visit / Sign-off
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <HardHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">No Field Calls Found</h3>
          <p className="text-slate-400 text-sm mt-1">No service calls match the selected filter tab.</p>
        </div>
      )}

      {/* Field Visit Completion Modal */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Field Call Dispatch #${selectedTicket?.ticketNumber}`} size="md">
        {selectedTicket && (
          <div className="space-y-5 text-sm text-slate-300">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h3 className="font-bold text-white text-base">{selectedTicket.customerName}</h3>
              <p className="text-xs text-cyan-400 font-medium mt-0.5">{selectedTicket.subject}</p>
              <p className="text-xs text-slate-400 mt-1">Product: {selectedTicket.productName}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified On-Site Location Dispatch</span>
            </div>

            {/* Workflow Action Buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Update Visit Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateCallStatusMutation.mutate({
                      id: selectedTicket._id,
                      status: 'IN_PROGRESS',
                      comment: 'Technician arrived on site and started diagnosis.',
                    })
                  }
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" /> Mark "In Progress"
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCallStatusMutation.mutate({
                      id: selectedTicket._id,
                      status: 'RESOLVED',
                      comment: resolutionNotes || 'Service visit completed successfully on site.',
                    })
                  }
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark "Resolved"
                </button>
              </div>
            </div>

            {/* Visit Resolution Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Technician Field Notes & Spares Used
              </label>
              <textarea
                rows={3}
                placeholder="Record work done, spare parts replaced, and customer verification notes..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TechnicianCallsPage;
