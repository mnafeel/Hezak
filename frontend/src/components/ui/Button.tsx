import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../store/theme';

const getButtonStyles = (theme: 'dark' | 'light' | 'blue' | 'purple' | 'green' | 'elegant' | 'fashion') => {
  const isLight = theme === 'light' || theme === 'elegant' || theme === 'fashion';
  const isElegant = theme === 'elegant';
  const isFashion = theme === 'fashion';
  
  return cva(
    'inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
      variants: {
        variant: {
          primary: 'bg-brand-500 text-white shadow-glow hover:bg-brand-600 focus-visible:ring-brand-400',
          secondary: isFashion
            ? 'bg-[#f3e8ff] text-[#581c87] border border-[#d8b4fe] hover:bg-[#ede9fe] focus-visible:ring-[#a855f7] shadow-lg'
            : isElegant
            ? 'bg-gradient-to-br from-[#f5f1e8] to-[#f0ebe0] text-[#2d1b0e] border border-[#ddd4c4] hover:border-[#c9a961]/60 hover:shadow-lg hover:shadow-[#c9a961]/25 focus-visible:ring-[#c9a961] shadow-lg'
            : isLight
            ? 'bg-gray-200 text-gray-900 border border-gray-300 hover:bg-gray-300 focus-visible:ring-gray-400'
            : 'bg-white/10 text-white border border-white/20 hover:bg-white/15 focus-visible:ring-white/30',
          outline: isFashion
            ? 'border border-[#d8b4fe] text-[#581c87] hover:bg-[#f3e8ff] focus-visible:ring-[#a855f7] shadow-md'
            : isElegant
            ? 'border-2 border-[#ddd4c4] text-[#2d1b0e] hover:border-[#c9a961] hover:bg-gradient-to-br hover:from-[#f5f1e8] hover:to-[#f0ebe0] hover:shadow-md hover:shadow-[#c9a961]/20 focus-visible:ring-[#c9a961] shadow-md'
            : isLight
            ? 'border border-gray-300 text-gray-900 hover:bg-gray-100 focus-visible:ring-gray-400'
            : 'border border-white/20 text-white hover:bg-white/10 focus-visible:ring-white/20',
          ghost: isFashion
            ? 'text-[#581c87] hover:bg-[#f3e8ff]'
            : isElegant
            ? 'text-[#2d1b0e] hover:bg-gradient-to-br hover:from-[#f5f1e8] hover:to-[#f0ebe0] hover:text-[#4a3a2a]'
            : isLight
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-slate-200 hover:bg-white/10'
        },
        size: {
          sm: 'px-4 py-2 text-sm',
          md: 'px-6 py-3 text-base',
          lg: 'px-8 py-4 text-lg'
        }
      },
      defaultVariants: {
        variant: 'primary',
        size: 'md'
      }
    }
  );
};

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<ReturnType<typeof getButtonStyles>> {}

const Button = ({
  className,
  variant,
  size,
  children,
  ...props
}: PropsWithChildren<ButtonProps>) => {
  const theme = useThemeStore((state) => state.theme);
  const location = useLocation();
  // Force dark theme for admin pages
  // Admin pages can be at /admin/* or /{adminSlug}/* where adminSlug is the custom admin path
  const isAdminPage = location.pathname.includes('/admin') || 
                      /^\/[^/]+\/(dashboard|products|orders|users|categories|banners|settings|reports|login)(\/|$)/.test(location.pathname);
  const effectiveTheme = isAdminPage ? 'dark' : theme;
  const buttonStyles = getButtonStyles(effectiveTheme);
  
  return (
    <button className={cn(buttonStyles({ variant, size, className }))} {...props}>
      {children}
    </button>
  );
};

export default Button;

