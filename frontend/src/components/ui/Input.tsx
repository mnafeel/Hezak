import { forwardRef, type InputHTMLAttributes } from 'react';
import { useThemeColors } from '../../hooks/useThemeColors';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const { getTextColor, getBorderColor, theme } = useThemeColors();
    
    return (
      <label className={cn(
        'flex w-full flex-col gap-2 text-sm font-medium',
        theme === 'light' ? 'text-gray-700' : theme === 'elegant' ? 'text-[#3d2817]' : theme === 'fashion' ? 'text-[#581c87]' : 'text-white'
      )}>
        {label && <span>{label}</span>}
        <input
          id={id}
          ref={ref}
          className={cn(
            `w-full rounded-xl border px-4 py-3 text-base focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60`,
            theme === 'light' 
              ? 'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400' 
              : theme === 'elegant' 
              ? 'border-[#ddd4c4] bg-[#faf8f3] text-[#2d1b0e] placeholder:text-[#7a6a5a]' 
              : theme === 'fashion' 
              ? 'border-[#d8b4fe] bg-[#faf5ff] text-[#581c87] placeholder:text-[#9333ea]' 
              : 'border-white/10 bg-white/5 text-white placeholder:text-slate-400',
            error && 'border-red-400 focus:ring-red-400/40',
            className
          )}
          {...props}
        />
        {error && <span className={cn(
          'text-xs',
          theme === 'light' ? 'text-red-600' : theme === 'elegant' ? 'text-red-700' : theme === 'fashion' ? 'text-red-600' : 'text-red-300'
        )}>{error}</span>}
      </label>
    );
  }
);

Input.displayName = 'Input';

export default Input;

