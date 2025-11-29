import type { ReactNode } from 'react';
import Card from './Card';
import { cn, formatCurrency } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  prefix?: string;
  icon?: ReactNode;
  format?: 'integer' | 'currency';
  className?: string;
}

const StatCard = ({
  label,
  value,
  prefix,
  icon,
  format = 'integer',
  className
}: StatCardProps) => {
  const display =
    format === 'currency' ? formatCurrency(value) : `${prefix ?? ''}${value.toLocaleString()}`;

  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wider text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{display}</p>
        </div>
        {icon && (
          <div className="rounded-full bg-white/10 p-4 text-white shadow-inner shadow-white/30">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;


