import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-200">
        {label && <span>{label}</span>}
        <textarea
          id={id}
          ref={ref}
          className={cn(
            'min-h-[140px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60',
            error && 'border-red-400 focus:ring-red-400/40',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-300">{error}</span>}
      </label>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;

