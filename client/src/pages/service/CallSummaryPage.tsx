import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardCheck, CheckCircle2, Clock, Star, Wrench, User,
  Printer, Package, Calendar, AlertTriangle, Phone, FileCheck,
} from 'lucide-react';

const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        className={`w-8 h-8 rounded-lg transition-all ${
          s <= value ? 'text-amber-400 bg-amber-500/20' : 'text-slate-600 bg-slate-800 hover:text-amber-400'
        }`}
      >
        <Star className="w-5 h-5 mx-auto" fill={s <= value ? 'currentColor' : 'none'} />
      </button>
    ))}
  </div>
);

const CallSummaryPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [filterTab, setFilterTab] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [printMode, setPrintMode] = useState<any>(null);

  const [workDone, setWorkDone] = useState('');
  const [partsUsed, setPartsUsed] = useState('');
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [technicianObservation, setTechnicianObservation] = useState('');
  const [nextRecommendation, setNextRecommendation] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState(5);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const res = await api.get('/complaints');
      return res.data.data;
    },
  });

  const closeMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await api.put(`/complaints/${id}`, payload);
      return res.data;
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      const closed = tickets.find((t: any) => t._id === vars.id);
      setPrintMode({ ...closed, ...vars.payload });
      setSelectedTicket(null);
      resetForm();
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to close ticket.'),
  });

  const resetForm = () => {
    setWorkDone(''); setPartsUsed(''); setTimeIn(''); setTimeOut('');
    setHoursSpent(''); setCustomerName(''); setTechnicianObservation('');
    setNextRecommendation(''); setSatisfactionRating(5); setErrorMsg('');
  };

  const openTickets = tickets.filter((t: any) => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status));
  const closedTickets = tickets.filter((t: any) => ['RESOLVED', 'CLOSED'].includes(t.status));
  const displayTickets = filterTab === 'OPEN' ? openTickets : closedTickets;

  const handleSubmitSummary = () => {
    if (!workDone.trim()) { setErrorMsg('Work done description is required.'); return; }
    if (!customerName.trim()) { setErrorMsg('Customer representative name is required for sign-off.'); return; }
    setErrorMsg('');
    closeMutation.mutate({
      id: selectedTicket._id,
      payload: {
        status: 'RESOLVED',
        resolutionNotes: workDone,
        satisfactionRating,
        statusComment: `Call closed by ${user?.name}. Work: ${workDone}`,
        closedAt: new Date().toISOString(),
      },
    });
  };

  const priorityColor: Record<string, string> = {
    URGENT: 'text-red-400 bg-red-500/10',
    HIGH: 'text-orange-400 bg-orange-500/10',
    MEDIUM: 'text-yellow-400 bg-yellow-500/10',
    LOW: 'text-green-400 bg-green-500/10',
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading call sheet..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Call Summary & Job Closure Report"
        subtitle="Complete service job, fill closure checklist, capture customer sign-off & generate printable report"
        icon={ClipboardCheck}
        action={
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {openTickets.length} Open Calls
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
              {closedTickets.length} Closed
            </span>
          </div>
        }
      />

      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'OPEN', label: `🟡 Open Calls (${openTickets.length})` },
          { id: 'CLOSED', label: `✅ Completed (${closedTickets.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filterTab === tab.id
                ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {displayTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <FileCheck className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No {filterTab === 'OPEN' ? 'open' : 'closed'} calls found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {displayTickets.map((ticket: any) => (
            <div key={ticket._id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-brand-500/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-cyan-400 text-xs font-mono">{ticket.ticketNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityColor[ticket.priority] || 'text-slate-400 bg-slate-800'}`}>
                      {ticket.priority}
                    </span>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <h3 className="font-bold text-white text-sm">{ticket.subject}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ticket.productName} • SN: {ticket.serialNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-medium text-slate-200 truncate">{ticket.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ticket.contactPhone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Wrench className="w-3.5 h-3.5 text-slate-500" />
                  <span>{ticket.assignedTechnicianName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                {['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(ticket.status) ? (
                  <button
                    onClick={() => { setSelectedTicket(ticket); resetForm(); setCustomerName(ticket.customerName); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Complete & Close Call
                  </button>
                ) : (
                  <button
                    onClick={() => setPrintMode(ticket)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                  >
                    <Printer className="w-4 h-4" /> View / Print Report
                  </button>
                )}
              </div>

              {ticket.resolutionNotes && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wide mb-1">Resolution Notes</p>
                  <p className="text-xs text-slate-300">{ticket.resolutionNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CLOSURE FORM MODAL */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Job Closure Report" size="lg">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400"><ClipboardCheck className="w-5 h-5" /></div>
              <div>
                <p className="font-bold text-white text-sm">{selectedTicket.ticketNumber} — {selectedTicket.subject}</p>
                <p className="text-xs text-slate-400">{selectedTicket.customerName} • {selectedTicket.productName}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Work Performed <span className="text-red-400">*</span></label>
              <textarea rows={3} value={workDone} onChange={(e) => setWorkDone(e.target.value)} placeholder="Describe all work done (inspection, repair, replacement, calibration...)" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><Package className="w-3.5 h-3.5 inline mr-1" />Spare Parts / Materials Used</label>
              <textarea rows={2} value={partsUsed} onChange={(e) => setPartsUsed(e.target.value)} placeholder="e.g. Oil Filter x1, Pressure Valve x2 (leave blank if none)" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><Clock className="w-3.5 h-3.5 inline mr-1" />Time In</label>
                <input type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><Clock className="w-3.5 h-3.5 inline mr-1" />Time Out</label>
                <input type="time" value={timeOut} onChange={(e) => setTimeOut(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Hours Spent</label>
                <input type="number" step="0.5" min="0" value={hoursSpent} onChange={(e) => setHoursSpent(e.target.value)} placeholder="e.g. 2.5" className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><AlertTriangle className="w-3.5 h-3.5 inline mr-1" />Technician Observations</label>
              <textarea rows={2} value={technicianObservation} onChange={(e) => setTechnicianObservation(e.target.value)} placeholder="Additional observations or technical notes..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none" />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><Calendar className="w-3.5 h-3.5 inline mr-1" />Next Recommended Service</label>
              <input type="text" value={nextRecommendation} onChange={(e) => setNextRecommendation(e.target.value)} placeholder="e.g. Full overhaul in 3 months, No action needed" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50" />
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3 block"><Star className="w-3.5 h-3.5 inline mr-1 text-amber-400" />Customer Satisfaction Rating</label>
              <StarRating value={satisfactionRating} onChange={setSatisfactionRating} />
              <p className="text-xs text-slate-500 mt-2">{['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][satisfactionRating]} — {satisfactionRating}/5</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><User className="w-3.5 h-3.5 inline mr-1" />Customer Representative (Sign-off) <span className="text-red-400">*</span></label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Name of customer person who accepted the work" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50" />
            </div>

            {errorMsg && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{errorMsg}</div>}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setSelectedTicket(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition">Cancel</button>
              <button onClick={handleSubmitSummary} disabled={closeMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm transition disabled:opacity-50">
                {closeMutation.isPending ? 'Closing...' : '✅ Close Call & Generate Report'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PRINT REPORT MODAL */}
      <Modal isOpen={!!printMode} onClose={() => setPrintMode(null)} title="Printable Job Closure Report" size="lg">
        {printMode && (
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">ServeWell CRM</h2>
                <p className="text-xs text-slate-400">Job Closure & Service Completion Report</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-cyan-400 font-mono">{printMode.ticketNumber}</p>
                <p className="text-xs text-slate-400">Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><p className="text-slate-500 uppercase font-semibold">Customer</p><p className="font-bold text-white">{printMode.customerName}</p><p className="text-slate-400">{printMode.contactPhone}</p></div>
              <div className="text-right"><p className="text-slate-500 uppercase font-semibold">Equipment</p><p className="font-bold text-white">{printMode.productName}</p><p className="text-slate-400">SN: {printMode.serialNumber || 'N/A'}</p></div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5"><p className="text-slate-500 uppercase mb-1">Technician</p><p className="font-semibold text-white">{printMode.assignedTechnicianName || user?.name}</p></div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5"><p className="text-slate-500 uppercase mb-1">Time In / Out</p><p className="font-semibold text-white">{timeIn || '--'} — {timeOut || '--'}</p></div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5"><p className="text-slate-500 uppercase mb-1">Hours Spent</p><p className="font-semibold text-white">{hoursSpent || '--'} hrs</p></div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
              <p className="text-slate-500 uppercase text-xs mb-1">Work Performed</p>
              <p className="text-slate-200">{printMode.resolutionNotes || 'N/A'}</p>
            </div>

            {partsUsed && <div className="p-3 rounded-xl bg-slate-900 border border-white/5"><p className="text-slate-500 uppercase text-xs mb-1">Parts Used</p><p className="text-slate-200">{partsUsed}</p></div>}

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div><p className="text-emerald-400 uppercase text-xs mb-1">Customer Sign-off</p><p className="font-semibold text-white">{customerName || printMode.customerName}</p></div>
              <div className="text-right">
                <p className="text-slate-500 uppercase text-xs mb-1">Satisfaction</p>
                <div className="flex gap-1 justify-end">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= (printMode.satisfactionRating || 5) ? 'text-amber-400' : 'text-slate-700'}`} fill={s <= (printMode.satisfactionRating || 5) ? 'currentColor' : 'none'} />)}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-white/5">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition"><Printer className="w-4 h-4" /> Print Report</button>
              <button onClick={() => setPrintMode(null)} className="py-2.5 px-4 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm transition">Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CallSummaryPage;
