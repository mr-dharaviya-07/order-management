import { Minus, Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBadge } from '../../components/StatusBadge';
import { getCartTotals, useCartStore } from '../../store/cart.store';
import type { Order } from '../../types';
import { money } from '../../utils/format';
import { CheckoutModal } from './CheckoutModal';
import { motion, AnimatePresence } from 'framer-motion';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [checkout, setCheckout] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const { lines, update, remove, clear } = useCartStore();
  const totals = getCartTotals(lines);

  useEffect(() => {
    if (lastOrder) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [lastOrder, onClose]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="cart-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-hidden"
          >
            {/* Backdrop */}
            <div
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Drawer container */}
            <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="w-screen max-w-md"
              >
                <div className="h-full flex flex-col bg-white dark:bg-slate-950 shadow-2xl border-l border-slate-100 dark:border-slate-800">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={20} className="text-brand-500" />
                      <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Your Cart</h2>
                    </div>
                    <button
                      aria-label="Close cart"
                      onClick={onClose}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-95 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    {lastOrder && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 p-4 border border-emerald-100 dark:border-emerald-900/50 text-sm"
                      >
                        <div className="font-bold text-emerald-800 dark:text-emerald-400">
                          Order #{lastOrder.orderNumber} successfully placed!
                        </div>
                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Status:</span>
                          <StatusBadge status={lastOrder.status} />
                        </div>
                      </motion.div>
                    )}

                    {lines.length === 0 ? (
                      <div className="grid h-64 place-items-center text-center text-slate-400 dark:text-slate-500">
                        <div>
                          <ShoppingBag size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4 stroke-[1.5]" />
                          <p className="text-base font-semibold">Your cart is empty</p>
                          <p className="text-xs text-slate-400 mt-1">Add items from the menu to build your order.</p>
                        </div>
                      </div>
                    ) : (
                      <motion.div layout className="space-y-5">
                        <AnimatePresence mode="popLayout">
                          {lines.map((line) => (
                            <motion.div
                              key={line.item.id}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, x: 50 }}
                              className="flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/40 border border-transparent hover:border-slate-100 dark:hover:border-slate-800/40 transition-colors"
                            >
                              <img
                                src={line.item.imageUrl}
                                alt={line.item.name}
                                className="h-20 w-20 rounded-xl object-cover shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
                              />
                              <div className="min-w-0 flex-1 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between gap-2">
                                    <h3 className="truncate text-sm font-bold text-slate-800 dark:text-white">
                                      {line.item.name}
                                    </h3>
                                    <button
                                      aria-label="Remove item"
                                      onClick={() => remove(line.item.id)}
                                      className="text-slate-400 hover:text-rose-500 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                                    {money(line.item.price)}
                                  </p>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <button
                                    aria-label="Decrease quantity"
                                    disabled={line.quantity <= 1}
                                    onClick={() => update(line.item.id, line.quantity - 1)}
                                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-400 active:scale-95 transition-all disabled:opacity-50"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <input
                                    aria-label="Quantity"
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={line.quantity}
                                    onChange={(e) => update(line.item.id, Math.max(1, Number(e.target.value)))}
                                    className="h-8 w-12 rounded-lg border border-slate-200 bg-transparent text-center text-sm font-semibold dark:border-slate-800 dark:text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                  />
                                  <button
                                    aria-label="Increase quantity"
                                    onClick={() => update(line.item.id, line.quantity + 1)}
                                    className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 dark:border-slate-800 dark:hover:bg-slate-900 dark:text-slate-400 active:scale-95 transition-all"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </div>

                  {/* Footer */}
                  {lines.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5 bg-slate-50/50 dark:bg-slate-950/50">
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Subtotal</span>
                          <span className="font-semibold">{money(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Delivery</span>
                          <span className="font-semibold">{money(totals.deliveryFee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>Tax</span>
                          <span className="font-semibold">{money(totals.tax)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-800 dark:border-slate-800 dark:text-white">
                          <span>Total</span>
                          <span className="text-xl text-brand-600 dark:text-brand-400">{money(totals.total)}</span>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 gap-3">
                        <button
                          onClick={clear}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-300 transition-all active:scale-95"
                        >
                          Clear
                        </button>
                        <button
                          disabled={!lines.length}
                          onClick={() => setCheckout(true)}
                          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 font-bold text-white shadow-md shadow-brand-500/10 hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50 py-3"
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checkout && (
          <motion.div
            key="checkout-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCheckout(false)}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-md"
          >
            <CheckoutModal
              onClose={() => setCheckout(false)}
              onPlaced={(order) => {
                setLastOrder(order);
                onClose();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

