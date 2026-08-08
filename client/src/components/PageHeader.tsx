import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon: Icon, action }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-brand-600/15">
            <Icon className="w-6 h-6 text-brand-400" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader;
