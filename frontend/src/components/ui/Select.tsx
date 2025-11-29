import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-200">
        {label && <span>{label}</span>}
        <select
          id={id}
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60',
            error && 'border-red-400 focus:ring-red-400/40',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-red-300">{error}</span>}
      </label>
    );
  }
);

Select.displayName = 'Select';

export default Select;

