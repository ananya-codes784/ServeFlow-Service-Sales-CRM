import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ size = 'md', text }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`${sizes[size]} border-2 border-brand-500 border-t-transparent rounded-full animate-spin`} />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
