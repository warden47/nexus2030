// components/ui/SkeletonLoader.tsx
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'card';

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonLoaderProps) => {
  const baseClasses =
    'animate-shimmer bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-200% rounded';

  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circle: 'rounded-full',
    rect: 'rounded-xl',
    card: 'rounded-2xl h-40 w-full',
  };

  return (
    <div
      style={{ width, height }}
      className={twMerge(
        clsx(baseClasses, variantClasses[variant], className)
      )}
    />
  );
};

export default SkeletonLoader;