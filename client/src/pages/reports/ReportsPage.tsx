import React from 'react';
import PageHeader from '../../components/PageHeader';
import { BarChart3, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const reportData = [
  { category: 'Breakdown Calls', count: 42, resolved: 38 },
  { category: 'Preventive Visit', count: 65, resolved: 65 },
  { category: 'AMC Renewals', count: 28, resolved: 26 },
  { category: 'Sales Pipeline', count: 18, resolved: 12 },
];

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Reports Engine & Analytics"
        subtitle="Generate & export custom operational, revenue, complaint SLA & AMC reports"
        icon={BarChart3}
        action={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white text-xs font-medium">
              <Filter className="w-4 h-4" /> Filter Date Range
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 text-xs font-semibold">
              <FileSpreadsheet className="w-4 h-4" /> Export Excel Report
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-bold text-slate-100 text-base">Service Resolution SLA Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Raised" />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved SLA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-bold text-slate-100 text-base">Module PDF Quick Export Center</h3>
          <div className="space-y-3">
            {[
              { name: 'Customer Master Directory Report', format: 'PDF / Excel', size: '1.2 MB' },
              { name: 'Monthly Service SLA & Field Tech Log', format: 'PDF / Excel', size: '2.4 MB' },
              { name: 'AMC Expiry & Renewal Forecast Report', format: 'PDF / Excel', size: '850 KB' },
              { name: 'Financial Revenue & Outstanding Ledger', format: 'PDF / Excel', size: '3.1 MB' },
            ].map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.format} • {r.size}</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 text-xs font-medium">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
