import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Skeleton } from '../components/Skeleton';
import { FoodCard } from '../features/menu/FoodCard';
import { FoodDetailsModal } from '../features/menu/FoodDetailsModal';
import { menuApi } from '../services/api';
import { useCartStore } from '../store/cart.store';
import { money } from '../utils/format';
import type { MenuItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name');
  const [selected, setSelected] = useState<MenuItem | null>(null);
  const add = useCartStore((s) => s.add);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['menu', search, category, sort],
    queryFn: () => menuApi.list({ search, category, sort }),
  });

  const categories = useMemo(() => {
    return Array.from(
      new Map((data ?? []).map((item) => [item.category?.slug, item.category])).values()
    ).filter(Boolean);
  }, [data]);

  const addItem = (item: MenuItem) => {
    add(item);
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <section className="shell py-10">
      {/* Hero Section */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 mb-4"
        >
          <Sparkles size={14} className="animate-pulse" />
          Satisfy Your Cravings
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-800 dark:text-white"
        >
          Fresh Food. <span className="gradient-text">Instant Tracking.</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-4 text-lg text-slate-500 dark:text-slate-400"
        >
          Explore gourmet dishes curated by world-class chefs, delivered straight to your door with live tracking.
        </motion.p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Filters Bar */}
          <div className="panel mb-8 grid gap-4 rounded-2xl p-4 sm:grid-cols-[1fr_auto_auto] items-center border border-slate-200/60 dark:border-slate-800/80 bg-white/50 backdrop-blur-md">
            <label className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                aria-label="Search menu"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-transparent pl-11 pr-4 text-sm dark:border-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
              />
            </label>

            <div className="flex gap-2">
              <div className="relative flex items-center">
                <SlidersHorizontal size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                <select
                  aria-label="Filter category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 pl-9 pr-8 text-sm dark:border-slate-800 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center">
                <ArrowUpDown size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
                <select
                  aria-label="Sort menu"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 pl-9 pr-8 text-sm dark:border-slate-800 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="name">Name</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {isError && (
            <div className="panel rounded-2xl p-6 text-rose-600 border border-rose-100 dark:border-rose-950 bg-rose-50/50 dark:bg-rose-950/20 text-center mb-8">
              Oops! Menu items could not be loaded. Please refresh the page.
            </div>
          )}

          {/* Cards Grid */}
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-2xl" />
                ))
              ) : data?.length ? (
                data.map((item) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    onAdd={() => addItem(item)}
                    onDetails={() => setSelected(item)}
                  />
                ))
              ) : (
                <div className="col-span-full panel rounded-2xl p-12 text-center text-slate-400 dark:text-slate-500">
                  No delicious matches found.
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sidebar / Chef Recommendations */}
        <aside className="panel h-max rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800/80 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-805 pb-3">
            <Sparkles className="text-brand-500" size={18} />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Chef's Specials</h2>
          </div>
          <div className="mt-5 space-y-4">
            {(data ?? []).slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/40 active:scale-98 transition-all group focus:outline-none"
              >
                <div className="relative overflow-hidden h-14 w-14 rounded-xl">
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    {item.name}
                  </span>
                  <span className="block text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                    {money(item.price)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {selected && (
          <FoodDetailsModal
            item={selected}
            onClose={() => setSelected(null)}
            onAdd={() => addItem(selected)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

