import { Moon, ShoppingBag, Sun, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { CartDrawer } from '../features/cart/CartDrawer';
import { useCartStore } from '../store/cart.store';
import { useThemeStore } from '../store/theme.store';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { motion, AnimatePresence } from 'framer-motion';

export function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  const dark = useThemeStore((s) => s.dark);
  const toggle = useThemeStore((s) => s.toggle);
  const lines = useCartStore((s) => s.lines);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const totalItems = lines.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="min-h-screen pb-12">
      <header className="glass-header sticky top-0 z-30 shadow-sm transition-all duration-300">
        <div className="shell flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3 font-semibold group">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              CG
            </span>
            <span className="hidden sm:block text-lg font-bold tracking-tight text-slate-800 dark:text-white">
              Crave<span className="gradient-text">Go</span>
            </span>
          </NavLink>

          {user && (
            <nav className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-900/80">
              {[
                { to: '/', label: 'Menu' },
                { to: '/orders', label: 'Orders' },
                ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin' }] : []),
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-950 dark:text-brand-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle theme"
              onClick={toggle}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <NavLink
              aria-label="Account"
              to="/login"
              className={({ isActive }) =>
                `grid h-10 w-10 place-items-center rounded-xl border transition-all active:scale-95 ${
                  isActive || user
                    ? 'border-brand-300 bg-brand-50/50 text-brand-600 dark:border-brand-800 dark:bg-brand-950/30 dark:text-brand-400'
                    : 'border-slate-200 bg-white/60 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              <UserRound size={18} />
            </NavLink>

            {user && (
              <button
                aria-label="Open cart"
                onClick={() => setCartOpen(true)}
                className="relative grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all active:scale-95 shadow-md"
              >
                <ShoppingBag size={18} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      key={totalItems}
                      className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ember px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="min-h-[calc(100vh-16rem)]"><Outlet /></main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

