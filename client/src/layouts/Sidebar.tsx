import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, AlertCircle, Wrench, FileText, TrendingUp,
  HardHat, Package, DollarSign, Building2, BarChart3, Settings,
  Globe, ChevronDown, ChevronRight, Menu, X, LogOut, Shield, User, Bell,
  ClipboardCheck, BookUser, MessageSquare, Navigation, Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'My Profile', icon: User, path: '/profile' },
  {
    label: 'Customers', icon: Users,
    children: [
      { label: 'Customer List', path: '/customers' },
      { label: 'Add Customer', path: '/customers/create' },
      { label: 'Contact Book', path: '/customers/contact-book' },
    ],
  },
  {
    label: 'Complaints', icon: AlertCircle,
    children: [
      { label: 'All Complaints', path: '/complaints' },
      { label: 'Raise Complaint', path: '/complaints/create' },
    ],
  },
  {
    label: 'Service', icon: Wrench,
    children: [
      { label: 'Service Tickets', path: '/services' },
      { label: 'Add Service Call', path: '/services/create' },
      { label: 'Call Summary Report', path: '/services/call-summary' },
    ],
  },
  {
    label: 'AMC', icon: FileText,
    children: [
      { label: 'All Contracts', path: '/amc' },
      { label: 'Add Contract', path: '/amc/create' },
    ],
  },
  {
    label: 'Sales CRM', icon: TrendingUp,
    children: [
      { label: 'Leads', path: '/sales/leads' },
      { label: 'Add Lead', path: '/sales/leads/create' },
      { label: 'Quotations', path: '/sales/quotations' },
    ],
  },
  {
    label: 'Technician', icon: HardHat,
    children: [
      { label: 'Assigned Calls', path: '/technician/calls' },
      { label: 'GPS Tracker', path: '/technician/gps' },
    ],
  },
  {
    label: 'Inventory', icon: Package,
    children: [
      { label: 'All Items', path: '/inventory' },
      { label: 'Add Item', path: '/inventory/create' },
      { label: 'Spare Issues', path: '/inventory/spare-issues' },
      { label: 'Product Master Catalog', path: '/inventory/products-master' },
    ],
  },
  {
    label: 'Finance', icon: DollarSign,
    children: [
      { label: 'Invoices', path: '/finance/invoices' },
      { label: 'Payments', path: '/finance/payments' },
      { label: 'Expense Tracker', path: '/finance/expenses' },
    ],
  },
  {
    label: 'HR', icon: Building2,
    children: [
      { label: 'Employees', path: '/hr/employees' },
      { label: 'Add Employee', path: '/hr/employees/create' },
      { label: 'Leave Management', path: '/hr/leave' },
    ],
  },
  { label: 'Reports', icon: BarChart3, path: '/reports' },
  {
    label: 'Admin', icon: Settings,
    children: [
      { label: 'Users & Roles', path: '/admin/users' },
      { label: 'System Settings', path: '/admin/settings' },
      { label: 'Msg Templates', path: '/admin/msg-templates' },
    ],
  },
  { label: 'Customer Portal', icon: Globe, path: '/portal' },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(() => {
    // Auto-expand the active section
    const active = menuItems.find(
      (item) => item.children?.some((c) => location.pathname.startsWith(c.path))
    );
    return active ? [active.label] : [];
  });

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const navLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-brand-600/20 text-brand-400 shadow-lg shadow-brand-600/5'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">ServeWell</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">CRM Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => {
          if (item.path) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          }

          const isExpanded = expandedMenus.includes(item.label);
          const isChildActive = item.children?.some((c) => location.pathname.startsWith(c.path));

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleSubmenu(item.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isChildActive ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {isExpanded && !collapsed && (
                <div className="ml-5 pl-3 border-l border-white/5 space-y-0.5 mt-1">
                  {item.children!.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-[13px] transition-all ${
                          isActive
                            ? 'text-brand-400 bg-brand-600/10 font-medium'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.role || 'ADMIN'}</p>
            </div>
          )}
        </div>
        <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-panel"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 glass-panel transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
