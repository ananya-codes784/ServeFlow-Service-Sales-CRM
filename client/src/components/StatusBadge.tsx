import React from 'react';

const statusStyles: Record<string, string> = {
  // Complaint statuses
  NEW: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  ASSIGNED: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  PENDING_SPARES: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  CLOSED: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  REOPENED: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  // AMC & Service
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  EXPIRED: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  PENDING_RENEWAL: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  TERMINATED: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  SCHEDULED: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  IN_TRANSIT: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  WORK_IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  // Sales stages
  CONTACTED: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  QUALIFIED: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  PROPOSAL_SENT: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  NEGOTIATION: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  WON: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  LOST: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  // Payment
  UNPAID: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  PARTIAL: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  PAID: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  OVERDUE: 'bg-red-500/15 text-red-400 border-red-500/20',
  // Priority
  LOW: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  MEDIUM: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  HIGH: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  URGENT: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  // Quotation
  DRAFT: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  SENT: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  ACCEPTED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  // Misc
  PRESENT: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  ABSENT: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  HALF_DAY: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  ON_LEAVE: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  VIP: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  REGULAR: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  ENTERPRISE: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  GOVERNMENT: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const style = statusStyles[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/20';
  const label = status.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide border ${style} ${className}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
