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
      <label className={`flex w-full flex-col gap-2 text-sm font-medium ${theme === 'light' ? getTextColor('secondary') : 'text-white'}`}>
        {label && <span>{label}</span>}
        <input
          id={id}
          ref={ref}
          className={cn(
            `w-full rounded-xl border ${theme === 'light' ? 'border-gray-300 bg-gray-50' : theme === 'elegant' ? 'border-[#ddd4c4] bg-[#f5f1e8]' : theme === 'fashion' ? 'border-[#d8b4fe] bg-[#f3e8ff]' : 'border-white/10 bg-white/5'} px-4 py-3 text-base ${getTextColor('primary')} ${theme === 'light' ? 'placeholder:text-gray-400' : theme === 'elegant' ? 'placeholder:text-[#7a6a5a]' : theme === 'fashion' ? 'placeholder:text-[#9333ea]' : 'placeholder:text-slate-400'} focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60`,
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

Input.displayName = 'Input';

export default Input;

