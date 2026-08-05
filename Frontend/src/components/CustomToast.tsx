import React from 'react';
import toast, { Toast, resolveValue } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CustomToastProps {
  t: Toast;
}

export function CustomToast({ t }: CustomToastProps) {
  const message = resolveValue(t.message, t);

  // Type configuration mapping
  const typeConfig = {
    success: {
      bg: 'bg-white/90 dark:bg-slate-950/80 border-emerald-500/30 dark:border-emerald-500/40',
      text: 'text-slate-800 dark:text-slate-200',
      progressBg: 'bg-emerald-500 dark:bg-emerald-400',
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />,
      glow: 'shadow-[0_8px_30px_rgb(16,185,129,0.12)]',
    },
    error: {
      bg: 'bg-white/90 dark:bg-slate-950/80 border-rose-500/30 dark:border-rose-500/40',
      text: 'text-slate-800 dark:text-slate-200',
      progressBg: 'bg-rose-500 dark:bg-rose-400',
      icon: <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />,
      glow: 'shadow-[0_8px_30px_rgb(244,63,94,0.12)]',
    },
    loading: {
      bg: 'bg-white/90 dark:bg-slate-950/80 border-brand-500/30 dark:border-brand-500/40',
      text: 'text-slate-800 dark:text-slate-200',
      progressBg: 'bg-brand-500 dark:bg-brand-400',
      icon: <Loader2 className="h-5 w-5 text-brand-500 dark:text-brand-400 animate-spin shrink-0" />,
      glow: 'shadow-[0_8px_30px_rgb(139,92,246,0.12)]',
    },
    blank: {
      bg: 'bg-white/90 dark:bg-slate-950/80 border-slate-200/50 dark:border-slate-800/80',
      text: 'text-slate-800 dark:text-slate-200',
      progressBg: 'bg-brand-500 dark:bg-brand-400',
      icon: null,
      glow: 'shadow-soft',
    },
  };

  const config = typeConfig[t.type as keyof typeof typeConfig] || typeConfig.blank;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15, scale: 0.95 }}
      animate={{ 
        opacity: t.visible ? 1 : 0, 
        y: t.visible ? 0 : -15, 
        scale: t.visible ? 1 : 0.95 
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      className={`
        relative overflow-hidden flex items-center justify-between gap-3 
        w-full max-w-sm px-4 py-3.5 rounded-2xl border backdrop-blur-xl 
        ${config.bg} ${config.glow} transition-colors duration-300
      `}
    >
      <div className="flex items-center gap-3 w-full">
        {config.icon}
        <div className={`text-sm font-semibold font-outfit ${config.text} break-words pr-2 leading-relaxed flex-1`}>
          {message}
        </div>
      </div>

      {t.type !== 'loading' && (
        <button
          onClick={() => toast.dismiss(t.id)}
          className={`
            p-1 rounded-lg transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800/50 
            text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300
          `}
          aria-label="Close toast"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Progress Bar */}
      {t.type !== 'loading' && t.duration !== Infinity && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: t.visible ? '0%' : '100%' }}
          transition={{ duration: (t.duration || 4000) / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-[3px] ${config.progressBg}`}
        />
      )}
    </motion.div>
  );
}
