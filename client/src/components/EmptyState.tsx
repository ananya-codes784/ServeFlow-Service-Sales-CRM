import React from 'react';
import { FileX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title = 'No data found', message = 'There are no records to display yet.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-slate-800/50 mb-4">
        <FileX className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>
      {action}
    </div>
  );
};

export default EmptyState;
