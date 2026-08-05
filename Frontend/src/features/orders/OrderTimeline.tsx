import { useMemo } from 'react';
import { CheckCircle2, Clock, Truck, ChefHat, Play, Flame, PackageCheck, Ban } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { statusLabel } from '../../utils/format';

const statusIcons: Record<OrderStatus, React.ComponentType<{ className?: string; size?: number }>> = {
  ORDER_RECEIVED: ClipboardListIcon,
  PREPARING: Flame,
  COOKING: ChefHat,
  READY: Play,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: Ban,
};

function ClipboardListIcon({ className, size }: { className?: string; size?: number }) {
  return <Clock className={className} size={size} />;
}

export function OrderTimeline({ order }: { order: Order }) {
  const events = useMemo(() => {
    return [...(order.statusHistory ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [order.statusHistory]);

  return (
    <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6">
      {events.map((event, index) => {
        const Icon = statusIcons[event.status] || CheckCircle2;
        const isLatest = index === events.length - 1;

        return (
          <div key={event.id} className="relative">
            {/* Pulsing indicator node */}
            <span
              className={`absolute -left-[31px] top-0.5 grid h-4.5 w-4.5 place-items-center rounded-full border-2 ${
                isLatest
                  ? 'border-brand-500 bg-brand-500 text-white animate-pulse shadow-md ring-4 ring-brand-500/20'
                  : 'border-slate-300 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLatest ? 'bg-white' : 'bg-slate-300 dark:bg-slate-700'}`} />
            </span>

            <div className="flex gap-3">
              <Icon
                size={16}
                className={`mt-0.5 ${
                  isLatest
                    ? 'text-brand-500 dark:text-brand-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              />
              <div>
                <div
                  className={`text-xs font-bold leading-none ${
                    isLatest
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {statusLabel(event.status)}
                </div>
                {event.note && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{event.note}</p>
                )}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                  {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

