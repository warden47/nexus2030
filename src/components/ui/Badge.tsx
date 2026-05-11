// components/ui/Badge.tsx
'use client';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type BadgeVariant = 'live' | 'new' | 'premium' | 'exclusive';

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  live: 'bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30 animate-neon-breathe',
  new: 'bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)] border-[var(--neon-cyan)]/30',
  premium: 'bg-[var(--primary)]/20 text-[var(--primary)] border-[var(--primary)]/30',
  exclusive: 'bg-gradient-to-r from-[var(--secondary)]/20 to-[var(--primary)]/20 text-[var(--text-primary)] border-[var(--secondary)]/30',
};

const Badge = ({ variant, children, className }: BadgeProps) => {
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border',
          variantStyles[variant],
          className
        )
      )}
    >
      {variant === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children ?? variant.toUpperCase()}
    </span>
  );
};

export default Badge;