import type { OrderStatus } from '../types';
import { statusLabel } from '../utils/format';

const tone: Record<OrderStatus, string> = {
  ORDER_RECEIVED: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200',
  PREPARING: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  COOKING: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
  READY: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200',
  OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
  DELIVERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone[status]}`}>{statusLabel(status)}</span>;
}
