import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizeClasses[size]} glass-panel rounded-2xl shadow-2xl animate-[fadeInScale_0.2s_ease-out]`}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
