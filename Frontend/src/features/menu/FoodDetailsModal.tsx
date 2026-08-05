import { X, Star, Clock, ShoppingCart } from 'lucide-react';
import type { MenuItem } from '../../types';
import { money } from '../../utils/format';
import { motion } from 'framer-motion';

export function FoodDetailsModal({ item, onAdd, onClose }: { item: MenuItem; onAdd: () => void; onClose: () => void }) {
  const mockRating = (4 + (item.name.length % 10) / 10).toFixed(1);
  const mockTime = 15 + (item.name.length % 4) * 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-md"
    >
      <motion.article
        initial={{ scale: 0.9, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl shadow-2xl border border-white/20 dark:border-slate-800/80"
      >
        <div className="relative">
          <img src={item.imageUrl} alt={item.name} className="h-80 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          <button
            aria-label="Close details"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-slate-900/80 text-white backdrop-blur-md hover:bg-slate-800 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
          
          <div className="absolute left-6 bottom-6 text-white">
            {item.category?.name && (
              <span className="rounded-lg bg-brand-500 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
                {item.category.name}
              </span>
            )}
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{item.name}</h2>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-5 mb-5">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={16} className="text-brand-500" />
                Delivery: {mockTime} mins
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                Rating: {mockRating}
              </span>
            </div>
            <span className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">{money(item.price)}</span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">{item.description}</p>
          
          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onAdd();
                onClose();
              }}
              className="flex-[2] btn-primary"
            >
              <ShoppingCart size={18} /> Add to Cart — {money(item.price)}
            </button>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

