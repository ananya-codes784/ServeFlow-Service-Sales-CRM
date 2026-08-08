import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import Modal from './Modal';
import { UserCheck, Calendar, AlertCircle, FileText, Wrench } from 'lucide-react';

interface ComplaintAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: {
    _id: string;
    ticketNumber: string;
    customerName: string;
    productName: string;
    subject: string;
    assignedTechnicianId?: string;
    assignedTechnicianName?: string;
    priority?: string;
  } | null;
}

const ComplaintAllocationModal: React.FC<ComplaintAllocationModalProps> = ({
  isOpen,
  onClose,
  complaint,
}) => {
  const queryClient = useQueryClient();
  const [selectedTechId, setSelectedTechId] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16)
  );
  const [priority, setPriority] = useState(complaint?.priority || 'MEDIUM');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Technicians list
  const { data: employees = [] } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await api.get('/hr');
      return res.data.data;
    },
  });

  const technicians = employees.filter(
    (e: any) =>
      e.role === 'TECHNICIAN' ||
      e.department?.toUpperCase().includes('SERVICE') ||
      e.department?.toUpperCase().includes('TECH') ||
      true
  );

  const allocateMutation = useMutation({
    mutationFn: async () => {
      const selectedTech = technicians.find((t: any) => t._id === selectedTechId || t.userId === selectedTechId);
      const techName = selectedTech ? selectedTech.name : 'Assigned Technician';

      const res = await api.put(`/complaints/${complaint?._id}/allocate`, {
        assignedTechnicianId: selectedTechId,
        assignedTechnicianName: techName,
        scheduledDate,
        priority,
        notes,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['serviceTickets'] });
      onClose();
      setSelectedTechId('');
      setNotes('');
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to allocate complaint ticket.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) {
      setErrorMsg('Please select a technician to allocate.');
      return;
    }
    allocateMutation.mutate();
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Allocate Complaint #${complaint.ticketNumber}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Customer:</span>
            <span className="text-white font-medium">{complaint.customerName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Product Issue:</span>
            <span className="text-cyan-400 font-medium">{complaint.productName}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Subject:</span>
            <span className="text-slate-200">{complaint.subject}</span>
          </div>
        </div>

        {/* Technician Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Assign Field Technician *
          </label>
          <div className="relative">
            <select
              value={selectedTechId}
              onChange={(e) => {
                setSelectedTechId(e.target.value);
                setErrorMsg('');
              }}
              required
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Select Available Technician --</option>
              {technicians.map((t: any) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.designation || t.department || 'Field Engineer'}) - {t.phone || 'Active'}
                </option>
              ))}
            </select>
            <UserCheck className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Schedule Visit & Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Promised Visit Date & Time
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Dispatch Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
            Dispatch Instructions / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Specify equipment symptoms, tools needed, or customer availability instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={allocateMutation.isPending}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50 shadow-lg shadow-cyan-600/20"
          >
            <Wrench className="w-3.5 h-3.5" />
            {allocateMutation.isPending ? 'Allocating...' : 'Allocate & Dispatch Call'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ComplaintAllocationModal;
