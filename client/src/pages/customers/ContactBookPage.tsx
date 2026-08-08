import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BookUser, Phone, Mail, MapPin, Building2, Search, Star } from 'lucide-react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const ContactBookPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => { const res = await api.get('/customers?limit=200'); return res.data.data; },
  });

  const filtered = useMemo(() => {
    let list = customers;
    if (search) list = list.filter((c: any) =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase())
    );
    if (activeLetter) list = list.filter((c: any) => c.companyName?.[0]?.toUpperCase() === activeLetter);
    return [...list].sort((a: any, b: any) => a.companyName?.localeCompare(b.companyName));
  }, [customers, search, activeLetter]);

  const categoryColor: Record<string, string> = {
    ENTERPRISE: 'text-violet-400 bg-violet-500/10',
    VIP: 'text-amber-400 bg-amber-500/10',
    REGULAR: 'text-slate-400 bg-slate-800',
    GOVERNMENT: 'text-blue-400 bg-blue-500/10',
  };

  if (isLoading) return <LoadingSpinner size="lg" text="Loading contact book..." />;

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Contact Book" subtitle="All customer contacts — searchable phonebook with direct call & email links" icon={BookUser}
        action={<span className="px-3 py-1.5 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-semibold border border-brand-500/20">{customers.length} Contacts</span>}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setActiveLetter(''); }} placeholder="Search by company, contact, phone, email or city..." className="w-full bg-slate-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50" />
      </div>

      <div className="flex flex-wrap gap-1">
        <button onClick={() => setActiveLetter('')} className={`w-8 h-8 rounded-lg text-xs font-bold transition ${!activeLetter ? 'bg-brand-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}>All</button>
        {ALPHABET.map(l => (
          <button key={l} onClick={() => setActiveLetter(activeLetter === l ? '' : l)} className={`w-8 h-8 rounded-lg text-xs font-bold transition ${activeLetter === l ? 'bg-brand-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}`}>{l}</button>
        ))}
      </div>

      <p className="text-xs text-slate-500">{filtered.length} contact{filtered.length !== 1 ? 's' : ''} {activeLetter ? `starting with "${activeLetter}"` : search ? `matching "${search}"` : 'total'}</p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500"><BookUser className="w-12 h-12 mb-3 opacity-30" /><p className="text-sm font-medium">No contacts found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => (
            <div key={c._id} className="glass-card p-4 rounded-2xl border border-white/5 hover:border-brand-500/20 transition-all group">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
                  {c.companyName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-white text-sm truncate">{c.companyName}</h3>
                    {c.category === 'VIP' && <Star className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="currentColor" />}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryColor[c.category] || 'text-slate-400'}`}>{c.category}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="text-slate-300 font-medium">{c.contactPerson}</span>
                </div>
                <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition group-hover:underline">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-mono font-semibold">{c.phone}</span>
                </a>
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition truncate">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{c.email}</span>
                </a>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{c.city}{c.state ? `, ${c.state}` : ''}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                <a href={`tel:${c.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"><Phone className="w-3.5 h-3.5" /> Call</a>
                <a href={`mailto:${c.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 text-xs font-semibold transition"><Mail className="w-3.5 h-3.5" /> Email</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactBookPage;
