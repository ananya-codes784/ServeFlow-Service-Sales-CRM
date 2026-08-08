import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  gradient: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendUp, gradient, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${gradient}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trendUp ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-white/70 font-medium">{title}</p>
      </div>
    </div>
  );
};

export default StatsCard;
