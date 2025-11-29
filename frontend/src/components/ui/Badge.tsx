import type { PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-slate-600/80 text-white border border-slate-500/50',
  success: 'bg-emerald-600/90 text-white border border-emerald-500/50',
  warning: 'bg-amber-600/90 text-white border border-amber-500/50',
  danger: 'bg-red-600/90 text-white border border-red-500/50'
};

const Badge = ({ variant = 'default', className, children }: PropsWithChildren<BadgeProps>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
      variantStyles[variant],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;


