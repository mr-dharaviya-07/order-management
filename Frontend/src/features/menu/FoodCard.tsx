import { motion } from 'framer-motion';
import { Plus, Star, Clock } from 'lucide-react';
import type { MenuItem } from '../../types';
import { money } from '../../utils/format';

export function FoodCard({ item, onAdd, onDetails }: { item: MenuItem; onAdd: () => void; onDetails: () => void }) {
  // Simulate rating and delivery time based on item ID/length for consistent mockup variety
  const mockRating = (4 + (item.name.length % 10) / 10).toFixed(1);
  const mockTime = 15 + (item.name.length % 4) * 5;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="panel group overflow-hidden rounded-2xl border border-slate-100 bg-white/70 shadow-premium transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/40"
    >
      <div className="relative overflow-hidden cursor-pointer" onClick={onDetails}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity" />
        <motion.img
          src={item.imageUrl}
          alt={item.name}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Floating Category Pill */}
        {item.category?.name && (
          <span className="absolute left-3 top-3 z-20 rounded-lg bg-white/80 dark:bg-slate-950/80 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm text-slate-800 dark:text-slate-200">
            {item.category.name}
          </span>
        )}

        {/* Floating Price Tag */}
        <span className="absolute right-3 bottom-3 z-20 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-md">
          {money(item.price)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2">
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-brand-400" />
            {mockTime} mins
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            {mockRating}
          </span>
        </div>

        <button onClick={onDetails} className="block w-full text-left focus:outline-none">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
            {item.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
            {item.description}
          </p>
        </button>

        <div className="mt-4 border-t border-slate-100/80 dark:border-slate-800/80 pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-600 active:scale-95 transition-all dark:bg-white dark:text-slate-900 dark:hover:bg-brand-500 dark:hover:text-white"
          >
            <Plus size={16} /> Add to cart
          </button>
        </div>
      </div>
    </motion.article>
  );
}

