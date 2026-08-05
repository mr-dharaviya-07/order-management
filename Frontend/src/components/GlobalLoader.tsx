import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalLoader() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Top glowing progress bar with a secondary pulse line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-[3px] z-[9999] bg-slate-100/10 dark:bg-slate-900/10 overflow-hidden"
          >
            <div className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-rose-500 animate-loading-bar w-full origin-left" />
          </motion.div>

          {/* Bottom-right premium floating glassmorphic indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="fixed bottom-6 right-6 z-[9998] flex items-center gap-3.5 rounded-2xl border border-white/20 bg-white/75 px-5 py-3 shadow-premium loader-glow backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-950/75 select-none"
          >
            {/* Custom counter-rotating nested spinner */}
            <div className="relative flex h-5 w-5 items-center justify-center">
              <div className="absolute h-full w-full rounded-full border-2 border-brand-500/20 border-t-brand-600 animate-spin" />
              <div className="absolute h-3 w-3 rounded-full border-[1.5px] border-rose-500/20 border-b-rose-500 animate-spin-reverse" />
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500 animate-pulse" />
            </div>

            {/* Glowing text branding */}
            <div className="flex flex-col">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                {isMutating > 0 ? 'CraveGo Processing' : 'CraveGo Loading'}
              </span>
              <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                Please wait a moment...
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
