import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CreditCard, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { useCartStore } from '../../store/cart.store';
import type { Order } from '../../types';
import { checkoutSchema, type CheckoutInput } from './checkout.schema';
import { motion } from 'framer-motion';

export function CheckoutModal({ onClose, onPlaced }: { onClose: () => void; onPlaced: (order: Order) => void }) {
  const navigate = useNavigate();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema) });
  
  const mutation = useMutation({
    mutationFn: (input: CheckoutInput) =>
      ordersApi.create({
        ...input,
        items: lines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })),
      }),
    onSuccess: (order) => {
      clear();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order successfully placed!');
      onPlaced(order);
      onClose();
      navigate('/orders');
    },
    onError: () => toast.error('Could not place order. Please try again.'),
  });

  const field = (name: keyof CheckoutInput, label: string, type = 'text') => (
    <label className="block text-sm">
      <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
      <input
        type={type}
        {...register(name)}
        className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white ${
          errors[name]
            ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500'
            : 'border-slate-200 dark:border-slate-800'
        }`}
      />
      {errors[name] && <span className="mt-1 block text-xs text-rose-500 font-medium">{errors[name]?.message}</span>}
    </label>
  );

  return (
    <motion.form
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.95, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
      className="glass-panel max-h-[92vh] w-full max-w-2xl overflow-auto rounded-3xl p-8 border border-white/20 dark:border-slate-800/80 shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-4">
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-brand-500" />
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Delivery Details</h2>
        </div>
        <button
          type="button"
          aria-label="Close checkout"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all active:scale-95"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {field('customerName', 'Full Name')}
        {field('phone', 'Phone Number', 'tel')}
        <div className="sm:col-span-2">{field('address', 'Delivery Address')}</div>
        {field('city', 'City')}
        {field('state', 'State')}
        {field('zipCode', 'Zip Code')}
        
        <label className="block text-sm sm:col-span-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Optional Instructions</span>
          <textarea
            {...register('instructions')}
            rows={3}
            placeholder="E.g., Ring bell twice, leave food on porch..."
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900 transition-all focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:text-white"
          />
        </label>
      </div>

      <div className="mt-8 flex gap-3 border-t border-slate-100 dark:border-slate-850 pt-5">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 btn-secondary py-3"
        >
          Go Back
        </button>
        <button
          disabled={isSubmitting || lines.length === 0}
          className="flex-[2] btn-primary py-3"
        >
          <ShoppingBag size={18} />
          {isSubmitting ? 'Placing Order...' : 'Place Order Now'}
        </button>
      </div>
    </motion.form>
  );
}

