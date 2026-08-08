import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, AlertCircle, Wrench, FileText, TrendingUp,
  HardHat, Package, DollarSign, Building2, BarChart3, Settings,
  Globe, Bell, User, Search, X,
} from 'lucide-react';

// ── All navigable items derived directly from the Sidebar structure ────────────
const ALL_NAV_ITEMS = [
  { label: 'Dashboard', parent: '', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Notifications', parent: '', path: '/notifications', icon: Bell },
  { label: 'My Profile', parent: '', path: '/profile', icon: User },

  // Customers
  { label: 'Customer List', parent: 'Customers', path: '/customers', icon: Users },
  { label: 'Add Customer', parent: 'Customers', path: '/customers/create', icon: Users },

  // Complaints
  { label: 'All Complaints', parent: 'Complaints', path: '/complaints', icon: AlertCircle },
  { label: 'Raise Complaint', parent: 'Complaints', path: '/complaints/create', icon: AlertCircle },

  // Service
  { label: 'Service Tickets', parent: 'Service', path: '/services', icon: Wrench },
  { label: 'Add Service Call', parent: 'Service', path: '/services/create', icon: Wrench },

  // AMC
  { label: 'All Contracts', parent: 'AMC', path: '/amc', icon: FileText },
  { label: 'Add AMC Contract', parent: 'AMC', path: '/amc/create', icon: FileText },

  // Sales CRM
  { label: 'Leads', parent: 'Sales CRM', path: '/sales/leads', icon: TrendingUp },
  { label: 'Add Lead', parent: 'Sales CRM', path: '/sales/leads/create', icon: TrendingUp },
  { label: 'Quotations', parent: 'Sales CRM', path: '/sales/quotations', icon: TrendingUp },

  // Technician
  { label: 'Assigned Calls', parent: 'Technician', path: '/technician/calls', icon: HardHat },

  // Inventory
  { label: 'All Items', parent: 'Inventory', path: '/inventory', icon: Package },
  { label: 'Add Item', parent: 'Inventory', path: '/inventory/create', icon: Package },
  { label: 'Spare Issues', parent: 'Inventory', path: '/inventory/spare-issues', icon: Package },
  { label: 'Product Master Catalog', parent: 'Inventory', path: '/inventory/products-master', icon: Package },

  // Finance
  { label: 'Invoices', parent: 'Finance', path: '/finance/invoices', icon: DollarSign },
  { label: 'Payments', parent: 'Finance', path: '/finance/payments', icon: DollarSign },
  { label: 'Expense Tracker', parent: 'Finance', path: '/finance/expenses', icon: DollarSign },

  // HR
  { label: 'Employees', parent: 'HR', path: '/hr/employees', icon: Building2 },
  { label: 'Add Employee', parent: 'HR', path: '/hr/employees/create', icon: Building2 },

  // Reports & Admin
  { label: 'Reports', parent: '', path: '/reports', icon: BarChart3 },
  { label: 'Users & Roles', parent: 'Admin', path: '/admin/users', icon: Settings },
  { label: 'System Settings', parent: 'Admin', path: '/admin/settings', icon: Settings },
  { label: 'Customer Portal', parent: '', path: '/portal', icon: Globe },
];

interface GlobalSearchProps {
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ className }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered results — search across label + parent
  const results = query.trim().length === 0
    ? []
    : ALL_NAV_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        return item.label.toLowerCase().includes(q) || item.parent.toLowerCase().includes(q);
      }).slice(0, 10);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0].path);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className || ''}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages & features..."
          className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:bg-slate-900 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {results.length} result{results.length !== 1 ? 's' : ''} found
            </span>
            <span className="text-[10px] text-slate-600">↵ to navigate</span>
          </div>

          {/* Results list */}
          <ul className="py-1 max-h-72 overflow-y-auto">
            {results.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group text-left"
                  >
                    {/* Icon bubble */}
                    <div className="w-8 h-8 rounded-xl bg-brand-600/10 border border-brand-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600/20 transition-colors">
                      <Icon className="w-4 h-4 text-brand-400" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      {/* Parent section label */}
                      {item.parent && (
                        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-600 leading-none mb-0.5">
                          {item.parent}
                        </p>
                      )}
                      {/* Page label with query highlight */}
                      <p className="text-sm font-medium text-slate-200 truncate leading-tight">
                        <HighlightMatch text={item.label} query={query} />
                      </p>
                    </div>

                    {/* Path hint */}
                    <span className="text-[9px] text-slate-600 font-mono flex-shrink-0 hidden sm:block">
                      {item.path}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer hint */}
          <div className="px-3 py-1.5 border-t border-white/5 flex items-center gap-3">
            <span className="text-[10px] text-slate-600">Click any result or press ↵ to go to first result</span>
          </div>
        </div>
      )}

      {/* No results state */}
      {isOpen && query.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 py-6 px-4 text-center">
          <p className="text-slate-500 text-xs">No pages found for "<span className="text-slate-300">{query}</span>"</p>
          <p className="text-[10px] text-slate-600 mt-1">Try searching: customers, invoices, complaints, leads...</p>
        </div>
      )}
    </div>
  );
};

// ── Highlight matching text in label ──────────────────────────────────────────
const HighlightMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/25 text-brand-300 rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

export default GlobalSearch;
