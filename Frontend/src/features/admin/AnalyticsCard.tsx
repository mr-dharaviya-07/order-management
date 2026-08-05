import type { LucideIcon } from 'lucide-react';

export function AnalyticsCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: LucideIcon }) {
  return (
    <div className="panel rounded-2xl p-6 border border-slate-200/60 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/40 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="mt-2.5 text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 shadow-sm">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

