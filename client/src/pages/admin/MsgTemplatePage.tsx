import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { MessageSquare, Plus, Edit, Trash2, Copy, CheckCircle2, Smartphone, Mail, Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'WHATSAPP', label: 'WhatsApp', icon: Smartphone, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'SMS', label: 'SMS', icon: Send, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'EMAIL', label: 'Email', icon: Mail, color: 'text-brand-400 bg-brand-500/10 border-brand-500/20' },
];

const DEFAULT_TEMPLATES = [
  { templateName: 'AMC Renewal Reminder', category: 'WHATSAPP', body: 'Dear {customerName}, your AMC Contract #{contractNumber} is expiring on {expiryDate}. Please contact us to renew. - ServeWell Team' },
  { templateName: 'Service Call Scheduled', category: 'WHATSAPP', body: 'Hello {customerName}, your service call for {productName} has been scheduled on {date} at {time}. Technician: {techName}. - ServeWell CRM' },
  { templateName: 'Complaint Resolved', category: 'SMS', body: 'Ticket #{ticketNumber} has been resolved. Rate your experience: {ratingLink}. Thank you - ServeWell' },
  { templateName: 'Invoice Due Reminder', category: 'EMAIL', subject: 'Payment Reminder - Invoice #{invoiceNumber}', body: 'Dear {customerName},\n\nThis is a reminder that Invoice #{invoiceNumber} of ₹{amount} is due on {dueDate}.\n\nPlease process the payment at your earliest convenience.\n\nRegards,\nServeWell Finance Team' },
];

const MsgTemplatePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterCat, setFilterCat] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({ templateName: '', category: 'WHATSAPP', subject: '', body: '', variables: '' });
  const [formError, setFormError] = useState('');

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['msg-templates'],
    queryFn: async () => {
      try { const res = await api.get('/msg-templates'); return res.data.data; }
      catch { return DEFAULT_TEMPLATES.map((t, i) => ({ ...t, _id: `default-${i}`, usageCount: 0, isActive: true, variables: [] })); }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/msg-templates', data); return res.data; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['msg-templates'] }); setIsCreateOpen(false); setForm({ templateName: '', category: 'WHATSAPP', subject: '', body: '', variables: '' }); setFormError(''); },
    onError: (err: any) => setFormError(err.response?.data?.message || 'Failed to create template.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.delete(`/msg-templates/${id}`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['msg-templates'] }),
  });

  const copyTemplate = (id: string, body: string) => {
    navigator.clipboard.writeText(body);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = templates.filter((t: any) => filterCat === 'ALL' || t.category === filterCat);

  const catInfo = (cat: string) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[0];

  if (isLoading) return <LoadingSpinner size="lg" text="Loading templates..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Master Message Templates" subtitle="Create & manage reusable WhatsApp, SMS and Email message templates with dynamic variables" icon={MessageSquare}
        action={
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg transition">
            <Plus className="w-4 h-4" /> New Template
          </button>
        }
      />

      <div className="flex gap-2">
        {['ALL', 'WHATSAPP', 'SMS', 'EMAIL'].map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${filterCat === cat ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}>{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((t: any) => {
          const info = catInfo(t.category);
          const Icon = info.icon;
          return (
            <div key={t._id} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-white/10 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${info.color}`}><Icon className="w-3.5 h-3.5" />{t.category}</span>
                  <h3 className="font-bold text-white text-sm">{t.templateName}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => copyTemplate(t._id, t.body)} className={`p-1.5 rounded-lg transition ${copiedId === t._id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`} title="Copy template body">
                    {copiedId === t._id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {!t._id?.startsWith('default-') && (
                    <button onClick={() => deleteMutation.mutate(t._id)} className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-rose-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>

              {t.subject && <p className="text-xs text-slate-400 mb-2 font-medium">Subject: <span className="text-slate-200">{t.subject}</span></p>}

              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                {t.body}
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>Variables: <span className="text-brand-400">{(t.body.match(/\{[^}]+\}/g) || []).join(', ') || 'None'}</span></span>
                <span>Used {t.usageCount || 0}x</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500"><MessageSquare className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm font-medium">No templates found</p></div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Template" size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Template Name</label>
            <input type="text" value={form.templateName} onChange={e => setForm({ ...form, templateName: e.target.value })} placeholder="e.g. AMC Renewal Reminder" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Category</label>
            <div className="flex gap-3">
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
                <button key={value} type="button" onClick={() => setForm({ ...form, category: value })} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition ${form.category === value ? `${color}` : 'border-white/10 text-slate-400 hover:text-white'}`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          {form.category === 'EMAIL' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Email Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Payment Reminder - Invoice #{invoiceNumber}" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50" />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 block">Message Body</label>
            <textarea rows={5} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Write your template. Use {variableName} for dynamic fields e.g. {customerName}, {ticketNumber}" className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none font-mono" />
            <p className="text-xs text-slate-500 mt-1">Use curly braces for variables: {`{customerName}`}, {`{ticketNumber}`}, {`{date}`}</p>
          </div>

          {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white text-sm font-medium transition">Cancel</button>
            <button onClick={() => createMutation.mutate({ ...form, variables: (form.body.match(/\{[^}]+\}/g) || []).map((v: string) => v.slice(1, -1)) })} disabled={createMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm transition disabled:opacity-50">
              {createMutation.isPending ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MsgTemplatePage;
