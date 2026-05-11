// components/ui/Toast.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import type { Toast as ToastType } from '@/store/uiStore';

interface ToastItemProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const iconMap = {
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  error: <AlertTriangle className="w-5 h-5 text-red-400" />,
  achievement: <Sparkles className="w-5 h-5 text-[var(--neon-cyan)]" />,
};

const borderColorMap = {
  success: 'border-emerald-400/20',
  error: 'border-red-400/20',
  achievement: 'border-[var(--neon-cyan)]/20',
};

export default function ToastItem({ toast, onClose }: ToastItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        flex items-start gap-3 p-4 rounded-xl backdrop-blur-xl bg-[var(--surface)]/90
        border ${borderColorMap[toast.type] ?? 'border-white/10'}
        shadow-2xl min-w-[280px] max-w-sm
      `}
    >
      <span className="shrink-0 mt-0.5">{iconMap[toast.type]}</span>
      <p className="text-sm text-[var(--text-primary)] flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-[var(--text-secondary)] hover:text-white transition"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// Also export the ToastContainer (used globally)
export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}