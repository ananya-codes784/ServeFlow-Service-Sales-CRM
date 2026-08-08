import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar, Plus, Check, X, Clock, User, Building2, Palmtree,
  HeartPulse, Briefcase, AlertTriangle, Baby, IndianRupee, Trash2
} from 'lucide-react';

const LEAVE_TYPES = [
  { value: 'SICK_LEAVE', label: 'Sick Leave', icon: HeartPulse, color: 'text-red-400 bg-red-500/10' },
  { value: 'CASUAL_LEAVE', label: 'Casual Leave', icon: Palmtree, color: 'text-emerald-400 bg-emerald-500/10' },
  { value: 'EARNED_LEAVE', label: 'Earned Leave', icon: Briefcase, color: 'text-brand-400 bg-brand-500/10' },
  { value: 'EMERGENCY_LEAVE', label: 'Emergency Leave', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' },
  { value: 'MATERNITY_LEAVE', label: 'Maternity Leave', icon: Baby, color: 'text-pink-400 bg-pink-500/10' },
  { value: 'UNPAID_LEAVE', label: 'Unpaid Leave', icon: IndianRupee, color: 'text-slate-400 bg-slate-800' },
];

const LeaveManagementPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [approveModal, setApproveModal] = useState<any>(null);
  const [approverComment, setApproverComment] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'SICK_LEAVE',
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [formError, setFormError] = useState('');

  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => { const res = await api.get('/hr'); return res.data.data; },
  });

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => { const res = await api.get('/leaves'); return res.data.data; },
  });

  const applyMutation = useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/leaves', data); return res.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); setIsApplyOpen(false); setFormData({ employeeId: '', leaveType: 'SICK_LEAVE', fromDate: '', toDate: '', reason: '' }); setFormError(''); },
    onError: (err: any) => setFormError(err.response?.data?.message || 'Failed to apply leave.'),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, comment }: any) => { const res = await api.put(`/leaves/${id}`, { status, approvedBy: user?.name, approverComment: comment }); return res.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); setApproveModal(null); setApproverComment(''); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/leaves/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const filteredLeaves = leaves.filter((l: any) => filterTab === 'ALL' || l.status === filterTab);

  const pending = leaves.filter((l: any) => l.status === 'PENDING').length;
  const approved = leaves.filter((l: any) => l.status === 'APPROVED').length;

  const leaveTypeInfo = (type: string) => LEAVE_TYPES.find(t => t.value === type) || LEAVE_TYPES[0];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading leave records..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Leave Management"
        subtitle="Apply for leave, track approvals, manage technician & staff leave calendar"
        icon={Calendar}
        action={
          <button
            onClick={() => setIsApplyOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: leaves.length, color: 'text-slate-200' },
          { label: 'Pending Approval', value: pending, color: 'text-amber-400' },
          { label: 'Approved', value: approved, color: 'text-emerald-400' },
          { label: 'Rejected', value: leaves.filter((l: any) => l.status === 'REJECTED').length, color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 rounded-2xl border border-white/5 text-center">
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Leave Type Legend */}
      <div className="flex flex-wrap gap-2">
        {LEAVE_TYPES.map(({ value, label, icon: Icon, color }) => (
          <span key={value} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </span>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${filterTab === tab ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Leave List */}
      {filteredLeaves.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Palmtree className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No leave applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeaves.map((leave: any) => {
            const typeInfo = leaveTypeInfo(leave.leaveType);
            const TypeIcon = typeInfo.icon;
            return (
              <div key={leave._id} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-white/10 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${typeInfo.color}`}><TypeIcon className="w-4 h-4" /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white text-sm">{leave.employeeName}</span>
                        <StatusBadge status={leave.status} />
                      </div>
                      <p className="text-xs text-slate-400">{leave.department}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className={`font-semibold ${typeInfo.color.split(' ')[0]}`}>{typeInfo.label}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(leave.fromDate).toLocaleDateString('en-IN')} → {new Date(leave.toDate).toLocaleDateString('en-IN')}</span>
                        <span className="font-semibold text-slate-300">{leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 max-w-md">{leave.reason}</p>
                      {leave.approverComment && (
                        <p className="text-xs text-amber-400 mt-1 italic">Manager: "{leave.approverComment}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {leave.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => { setApproveModal({ ...leave, action: 'APPROVED' }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => { setApproveModal({ ...leave, action: 'REJECTED' }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(leave._id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyOpen} onClose={() => setIsApplyOpen(false)} title="Apply for Leave" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block"><User className="w-3.5 h-3.5 inline mr-1" />Select Employee</label>
            <select value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50">
              <option value="">-- Select Employee --</option>
              {employees.map((emp: any) => <option key={emp._id} value={emp.employeeId}>{emp.name} ({emp.department})</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Leave Type</label>
            <div className="grid grid-cols-2 gap-2">
              {LEAVE_TYPES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveType: value })}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${formData.leaveType === value ? `${color} border-current` : 'border-white/10 text-slate-400 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">From Date</label>
              <input type="date" value={formData.fromDate} onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">To Date</label>
              <input type="date" value={formData.toDate} onChange={(e) => setFormData({ ...formData, toDate: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-brand-500/50" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Reason</label>
            <textarea rows={3} value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Please describe the reason for leave..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none" />
          </div>

          {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsApplyOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition">Cancel</button>
            <button onClick={() => applyMutation.mutate(formData)} disabled={applyMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm transition disabled:opacity-50">
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal isOpen={!!approveModal} onClose={() => setApproveModal(null)} title={`${approveModal?.action === 'APPROVED' ? '✅ Approve' : '❌ Reject'} Leave Request`} size="sm">
        {approveModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/10">
              <p className="font-semibold text-white text-sm">{approveModal.employeeName}</p>
              <p className="text-xs text-slate-400 mt-0.5">{approveModal.leaveType.replace('_', ' ')} • {approveModal.totalDays} days</p>
              <p className="text-xs text-slate-500 mt-2">{approveModal.reason}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Manager Comment (Optional)</label>
              <textarea rows={2} value={approverComment} onChange={(e) => setApproverComment(e.target.value)} placeholder="Add a comment for the employee..." className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setApproveModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm font-medium transition hover:text-white">Cancel</button>
              <button
                onClick={() => statusMutation.mutate({ id: approveModal._id, status: approveModal.action, comment: approverComment })}
                disabled={statusMutation.isPending}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition disabled:opacity-50 ${approveModal.action === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}
              >
                {statusMutation.isPending ? 'Processing...' : `Confirm ${approveModal.action}`}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveManagementPage;
