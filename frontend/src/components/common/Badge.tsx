import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'COMPLETED':
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REJECTED':
      case 'FAILED':
      case 'SUSPENDED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'REVERSED':
      case 'FROZEN':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-700/50 text-slate-400 border-slate-600/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()} ${className}`}
    >
      {status}
    </span>
  );
};