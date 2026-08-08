import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, ClipboardList, Filter, ChevronDown } from 'lucide-react';
import { useCallback, useState } from 'react';
import { CustomSelect } from '../components/CustomSelect';
import { Skeleton } from '../components/Skeleton';
import { OrderCard } from '../features/orders/OrderCard';
import { useRealtimeOrder } from '../hooks/useRealtimeOrder';
import { ordersApi } from '../services/api';
import type { OrderStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export function OrderHistoryPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['orders', search, status],
    queryFn: () => ordersApi.list({ search, status }),
  });

  useRealtimeOrder(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }, [queryClient])
  );

  const statuses: OrderStatus[] = [
    'ORDER_RECEIVED',
    'PREPARING',
    'COOKING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  // Group active vs completed orders
  const activeOrders = data?.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') ?? [];
  const pastOrders = data?.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED') ?? [];

  return (
    <section className="shell py-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white sm:text-4xl">Order History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Check current kitchen progress and tracking logs in real-time.</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="panel mb-8 grid gap-4 rounded-2xl p-4 sm:grid-cols-[1fr_240px] items-center border border-slate-200/60 dark:border-slate-800/80 bg-white/50 backdrop-blur-md">
        <form 
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }} 
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            aria-label="Search orders"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (val === '') setSearch('');
            }}
            placeholder="Search customer name, phone or Order ID..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-11 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
          />
        </form>
        
        <CustomSelect
          aria-label="Filter order status"
          value={status}
          onChange={setStatus}
          icon={<Filter size={14} />}
          options={[
            { value: '', label: 'All Statuses' },
            ...statuses.map((s) => ({ value: s, label: s.replace(/_/g, ' ') }))
          ]}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-44 rounded-2xl" />
        </div>
      ) : data?.length ? (
        <div className="space-y-10">
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Active Orders ({activeOrders.length})
              </h2>
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <ClipboardList size={18} className="text-slate-400" />
                Completed & Cancelled Orders ({pastOrders.length})
              </h2>
              <div className="space-y-4">
                {pastOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="panel rounded-2xl p-16 text-center text-slate-400 dark:text-slate-500">
          <ClipboardList size={48} className="mx-auto text-slate-350 dark:text-slate-700 mb-4 stroke-[1.5]" />
          <p className="text-lg font-bold">No Orders Found</p>
          <p className="text-xs text-slate-400 mt-1">Place an order first to begin tracking here.</p>
        </div>
      )}
    </section>
  );
}

