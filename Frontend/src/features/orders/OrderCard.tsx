import { useState } from 'react';
import type { Order } from '../../types';
import { money } from '../../utils/format';
import { StatusBadge } from '../../components/StatusBadge';
import { OrderTimeline } from './OrderTimeline';
import { ChevronDown, ChevronUp, Package, Calendar } from 'lucide-react';

export function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="panel rounded-2xl p-6 border border-slate-200/60 bg-white/70 dark:border-slate-800/80 dark:bg-slate-900/40 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <Package size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Order #{order.orderNumber}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Calendar size={12} />
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 active:scale-95 transition-all"
            aria-label={expanded ? 'Collapse items' : 'Expand items'}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 border-t border-slate-100 dark:border-slate-850 pt-5">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <ul className="space-y-2.5 text-sm">
            {(expanded ? order.items : order.items.slice(0, 2)).map((item) => (
              <li key={item.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="font-medium">
                  {item.quantity}x <span className="text-slate-800 dark:text-white">{item.menuItem?.name}</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{money(item.lineTotal)}</span>
              </li>
            ))}
            {!expanded && order.items.length > 2 && (
              <li>
                <button
                  onClick={() => setExpanded(true)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  + {order.items.length - 2} more items
                </button>
              </li>
            )}
          </ul>

          <div className="mt-5 space-y-1.5 border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{money(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax (8.25%)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{money(order.tax)}</span>
            </div>
          </div>

          <div className="mt-3 flex justify-between border-t border-slate-100 dark:border-slate-850 pt-3">
            <span className="text-sm font-bold text-slate-800 dark:text-white">Grand Total</span>
            <span className="text-lg font-black text-brand-600 dark:text-brand-400">{money(order.total)}</span>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-850">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Tracking History</span>
          <OrderTimeline order={order} />
        </div>
      </div>
    </article>
  );
}

