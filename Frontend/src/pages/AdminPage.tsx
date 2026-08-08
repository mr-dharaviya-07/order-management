import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, CheckCircle, Clock, DollarSign, PackageSearch, Search, ShoppingCart, Trash2, XCircle, Pencil, IndianRupee, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CustomSelect } from '../components/CustomSelect';
import { Skeleton } from '../components/Skeleton';
import { StatusBadge } from '../components/StatusBadge';
import { AnalyticsCard } from '../features/admin/AnalyticsCard';
import { MenuForm } from '../features/admin/MenuForm';
import { dashboardApi, menuApi, ordersApi } from '../services/api';
import type { MenuItem, OrderStatus } from '../types';
import { money, statusLabel } from '../utils/format';

const statuses: OrderStatus[] = ['ORDER_RECEIVED', 'PREPARING', 'COOKING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

const RevenueTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-950/95">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">
          {money(Number(payload[0].value))}
        </p>
      </div>
    );
  }
  return null;
};

const StatusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-950/95">
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{statusLabel(data.status)}</p>
        <p className="text-sm font-bold text-slate-850 dark:text-white mt-0.5">
          Orders: <span className="font-extrabold text-brand-600 dark:text-brand-400">{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function AdminPage() {
  const [editing, setEditing] = useState<MenuItem | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [menuSearchInput, setMenuSearchInput] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const queryClient = useQueryClient();
  const stats = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.stats });
  const menu = useQuery({ queryKey: ['menu', menuSearch], queryFn: () => menuApi.list({ search: menuSearch }) });
  const orders = useQuery({ queryKey: ['orders', orderSearch, orderStatus], queryFn: () => ordersApi.list({ search: orderSearch, status: orderStatus }) });
  
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.status(id, status),
    onSuccess: () => {
      toast.success('Order status successfully updated');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const cancelOrder = useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: () => {
      toast.success('Order successfully cancelled');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const removeMenu = useMutation({
    mutationFn: menuApi.remove,
    onSuccess: () => {
      toast.success('Menu item successfully deleted');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setDeleteId(null);
    }
  });

  return (
    <section className="shell py-10">
      <div className="mb-8">
        <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/40 px-3 py-1 rounded-full">
          Operations Control
        </span>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-800 dark:text-white sm:text-4xl">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor real-time sales performance, active menus, and queue updates.</p>
      </div>

      {stats.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AnalyticsCard label="Total Orders" value={stats.data?.totalOrders ?? 0} icon={ShoppingCart} />
          <AnalyticsCard label="Total Revenue" value={money(stats.data?.revenue ?? 0)} icon={IndianRupee} />
          <AnalyticsCard label="Pending Orders" value={stats.data?.pendingOrders ?? 0} icon={Clock} />
          <AnalyticsCard label="Completed Orders" value={stats.data?.completedOrders ?? 0} icon={CheckCircle} />
        </div>
      )}

      {/* Analytics Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="panel rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 bg-white/40 backdrop-blur-md">
          <div className="mb-5 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <BarChart3 size={18} className="text-brand-500" />
            Revenue Performance
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.data?.revenueSeries ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<RevenueTooltip />} />
                <Bar dataKey="total" fill="url(#brandGradient)" radius={[6, 6, 0, 0]}>
                  {/* Gradient for bar fill */}
                  <defs>
                    <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 bg-white/40 backdrop-blur-md">
          <div className="mb-5 flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <PackageSearch size={18} className="text-rose-500" />
            Orders by Status
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.data?.byStatus ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="status" tickLine={false} tickFormatter={(v) => String(v).slice(0, 8)} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<StatusTooltip />} />
                <Bar dataKey="count" fill="url(#roseGradient)" radius={[6, 6, 0, 0]}>
                  <defs>
                    <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Forms & Tables Section */}
      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <div className="panel rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 bg-white/40 backdrop-blur-md">
          <h2 className="mb-5 text-lg font-bold text-slate-800 dark:text-white">
            {editing ? '📝 Edit Menu Item' : '✨ Create Menu Item'}
          </h2>
          <MenuForm item={editing} onDone={() => setEditing(undefined)} />
        </div>

        <div className="panel overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 p-6">
            <div className="font-bold text-slate-800 dark:text-white">Manage Menu Catalog</div>
            <form 
              onSubmit={(e) => { e.preventDefault(); setMenuSearch(menuSearchInput); }} 
              className="relative w-full sm:w-72"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                aria-label="Search menu in admin"
                value={menuSearchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setMenuSearchInput(val);
                  if (val === '') setMenuSearch('');
                }}
                placeholder="Search menu catalog..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-transparent pl-9 pr-4 text-xs dark:border-slate-850 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 dark:bg-slate-900/50">
                <tr>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Item Details</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Price</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider">Available</th>
                  <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {menu.data?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                    <td className="p-4">
                      <button onClick={() => setEditing(item)} className="font-bold text-slate-850 dark:text-slate-200 hover:text-brand-500 transition-colors">
                        {item.name}
                      </button>
                      <div className="text-xs text-slate-400 mt-0.5">{item.category?.name}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{money(item.price)}</td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450'
                      }`}>
                        {item.isAvailable ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <button
                          aria-label="Edit item"
                          onClick={() => setEditing(item)}
                          className="text-slate-400 hover:text-brand-500 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          aria-label="Delete item"
                          onClick={() => setDeleteId(item.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!menu.data?.length && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 dark:text-slate-500">
                      No catalog matches found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="panel mt-8 overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 p-6">
          <div className="font-bold text-slate-800 dark:text-white">Active Queue & Orders</div>
          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-[260px_220px]">
            <form 
              onSubmit={(e) => { e.preventDefault(); setOrderSearch(orderSearchInput); }} 
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                aria-label="Search orders in admin"
                value={orderSearchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setOrderSearchInput(val);
                  if (val === '') setOrderSearch('');
                }}
                placeholder="Search orders..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-transparent pl-9 pr-4 text-xs dark:border-slate-850 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </form>
            <CustomSelect
              aria-label="Filter orders in admin"
              value={orderStatus}
              onChange={setOrderStatus}
              options={[
                { value: '', label: 'All statuses' },
                ...statuses.map((s) => ({ value: s, label: statusLabel(s) }))
              ]}
              className="w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 dark:bg-slate-900/50">
              <tr>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Order ID</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Customer Info</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Amount</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Status</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider">Update Status</th>
                <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Cancel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {orders.data?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-850 dark:text-slate-200">#{order.orderNumber}</span>
                    <div className="text-xs text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold">{order.customerName}</span>
                    <div className="text-xs text-slate-400 mt-0.5">{order.phone}</div>
                  </td>
                  <td className="p-4 font-bold text-slate-800 dark:text-white">{money(order.total)}</td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <CustomSelect
                      value={order.status}
                      disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                      onChange={(val) => updateStatus.mutate({ id: order.id, status: val as OrderStatus })}
                      options={statuses.map((s) => ({ value: s, label: statusLabel(s) }))}
                      className="w-40"
                    />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      aria-label="Cancel order"
                      disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
                      onClick={() => cancelOrder.mutate(order.id)}
                      className="text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!orders.data?.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No order queue entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {deleteId && (
        <ConfirmDialog
          title="Delete Menu Catalog Item"
          body="Are you sure you want to soft delete this item? Historical statistics and past orders will remain intact."
          onClose={() => setDeleteId(null)}
          onConfirm={() => removeMenu.mutate(deleteId)}
        />
      )}
    </section>
  );
}

