// components/ui/Card.tsx
'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  glass?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: 'lift' | 'glow' | 'none';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const Card = ({
  children,
  glass = true,
  glow = false,
  padding = 'md',
  hover = 'glow',
  className,
  ...props
}: CardProps) => {
  return (
    <motion.div
      whileHover={hover === 'lift' ? { y: -4 } : undefined}
      className={twMerge(
        clsx(
          'rounded-2xl transition-all',
          glass && 'glass', // .glass global CSS class
          !glass && 'bg-[var(--surface)] border border-white/10',
          glow && 'shadow-glow-primary',
          paddingStyles[padding],
          hover === 'glow' && 'hover:shadow-glow-primary hover:border-[var(--primary)]/30',
          className
        )
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;