import { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgColor = 'bg-emerald-100 dark:bg-emerald-900/30', 
  iconTextColor = 'text-emerald-600 dark:text-emerald-400',
  className = ''
}: StatCardProps) {
  return (
    <div className={`rounded-2xl bg-white p-6 border border-zinc-200 shadow-xl dark:bg-zinc-900/80 dark:border-zinc-800 ${className}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
