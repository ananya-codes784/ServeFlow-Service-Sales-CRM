import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm glass-panel rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2.5 rounded-xl ${isDestructive ? 'bg-rose-500/15' : 'bg-amber-500/15'}`}>
            <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-rose-400' : 'text-amber-400'}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${isDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
