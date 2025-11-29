import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../store/theme';

export const useThemeColors = () => {
  const location = useLocation();
  const storeTheme = useThemeStore((state) => state.theme);
  
  // Check if we're in admin context - always use dark theme for admin pages
  // Admin pages can be at /admin/* or /{adminSlug}/* where adminSlug is the custom admin path
  const isAdminPage = location.pathname.includes('/admin') || 
                      /^\/[^/]+\/(dashboard|products|categories|users|orders|reports|settings|login)(\/|$)/.test(location.pathname);
  
  // Force dark theme for admin pages
  const theme = isAdminPage ? 'dark' : storeTheme;

  const getTextColor = (type: 'primary' | 'secondary' | 'tertiary' = 'primary') => {
    if (theme === 'light') {
      switch (type) {
        case 'primary':
          return 'text-gray-900';
        case 'secondary':
          return 'text-gray-600';
        case 'tertiary':
          return 'text-gray-500';
        default:
          return 'text-gray-900';
      }
    }
    if (theme === 'elegant') {
      switch (type) {
        case 'primary':
          return 'text-[#2d1b0e]';
        case 'secondary':
          return 'text-[#4a3a2a]';
        case 'tertiary':
          return 'text-[#6a5a4a]';
        default:
          return 'text-[#2d1b0e]';
      }
    }
    if (theme === 'fashion') {
      switch (type) {
        case 'primary':
          return 'text-[#581c87]';
        case 'secondary':
          return 'text-[#7c3aed]';
        case 'tertiary':
          return 'text-[#9333ea]';
        default:
          return 'text-[#581c87]';
      }
    }
    switch (type) {
      case 'primary':
        return 'text-white';
      case 'secondary':
        return 'text-slate-300';
      case 'tertiary':
        return 'text-slate-400';
      default:
        return 'text-white';
    }
  };

  const getBgColor = (type: 'panel' | 'card' | 'button' = 'panel') => {
    if (theme === 'light') {
      switch (type) {
        case 'panel':
          return 'bg-white border border-gray-200/80 shadow-xl';
        case 'card':
          return 'bg-white border border-gray-200/80 shadow-lg';
        case 'button':
          return 'bg-gray-50 border border-gray-300/80 shadow-md';
        default:
          return 'bg-white border border-gray-200/80 shadow-xl';
      }
    }
    if (theme === 'elegant') {
      switch (type) {
        case 'panel':
          return 'bg-[#faf8f3] border border-[#e8ddd0] shadow-2xl';
        case 'card':
          return 'bg-[#faf8f3] border border-[#e8ddd0] shadow-xl';
        case 'button':
          return 'bg-[#f5f1e8] border border-[#ddd4c4] shadow-lg';
        default:
          return 'bg-[#faf8f3] border border-[#e8ddd0] shadow-2xl';
      }
    }
    if (theme === 'fashion') {
      switch (type) {
        case 'panel':
          return 'bg-[#faf5ff] border border-[#e9d5ff] shadow-2xl';
        case 'card':
          return 'bg-[#faf5ff] border border-[#e9d5ff] shadow-xl';
        case 'button':
          return 'bg-[#f3e8ff] border border-[#d8b4fe] shadow-lg';
        default:
          return 'bg-[#faf5ff] border border-[#e9d5ff] shadow-2xl';
      }
    }
    switch (type) {
      case 'panel':
        return 'bg-white/5 border border-white/10';
      case 'card':
        return 'bg-white/5 border border-white/10';
      case 'button':
        return 'bg-white/10 border border-white/20';
      default:
        return 'bg-white/5 border border-white/10';
    }
  };

  const getBorderColor = () => {
    if (theme === 'elegant') {
      return 'border-[#e8ddd0]';
    }
    if (theme === 'fashion') {
      return 'border-[#e9d5ff]';
    }
    return theme === 'light' ? 'border-gray-300' : 'border-white/10';
  };

  const getGlassPanelClass = () => {
    if (theme === 'light') {
      return 'bg-white border border-gray-200/80 shadow-xl shadow-gray-200/50 backdrop-blur-sm';
    }
    if (theme === 'elegant') {
      return 'bg-[#faf8f3] border border-[#e8ddd0] shadow-2xl shadow-[#c9a961]/20 backdrop-blur-sm';
    }
    if (theme === 'fashion') {
      return 'bg-[#faf5ff] border border-[#e9d5ff] shadow-2xl shadow-[#a855f7]/20 backdrop-blur-sm';
    }
    return 'glass-panel bg-white/5 border border-white/10 shadow-xl shadow-black/20 backdrop-blur-sm';
  };

  const getShadowClass = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    if (theme === 'light') {
      const shadows = {
        sm: 'shadow-sm shadow-gray-200/30',
        md: 'shadow-md shadow-gray-300/40',
        lg: 'shadow-lg shadow-gray-400/50',
        xl: 'shadow-xl shadow-gray-500/60',
      };
      return shadows[size];
    }
    if (theme === 'elegant') {
      // Premium late color shadows with gold/rose accents
      const shadows = {
        sm: 'shadow-sm shadow-[#c9a961]/20 shadow-[#d4a574]/10',
        md: 'shadow-md shadow-[#c9a961]/25 shadow-[#d4a574]/15',
        lg: 'shadow-lg shadow-[#c9a961]/30 shadow-[#d4a574]/20',
        xl: 'shadow-2xl shadow-[#c9a961]/35 shadow-[#d4a574]/25',
      };
      return shadows[size];
    }
    if (theme === 'fashion') {
      const shadows = {
        sm: 'shadow-sm shadow-[#a855f7]/15',
        md: 'shadow-md shadow-[#a855f7]/20',
        lg: 'shadow-lg shadow-[#a855f7]/25',
        xl: 'shadow-2xl shadow-[#a855f7]/30',
      };
      return shadows[size];
    }
    const shadows = {
      sm: 'shadow-sm shadow-black/20',
      md: 'shadow-md shadow-black/30',
      lg: 'shadow-lg shadow-black/40',
      xl: 'shadow-xl shadow-black/50',
    };
    return shadows[size];
  };

  const getHoverEffect = () => {
    if (theme === 'light') {
      return 'hover:shadow-lg hover:shadow-gray-300/50 transition-all duration-300';
    }
    if (theme === 'elegant') {
      // Premium late color hover with gold glow
      return 'hover:shadow-xl hover:shadow-[#c9a961]/30 hover:shadow-[#d4a574]/20 hover:scale-[1.02] hover:border-[#c9a961]/40 transition-all duration-300';
    }
    if (theme === 'fashion') {
      return 'hover:shadow-xl hover:shadow-[#a855f7]/25 hover:scale-[1.02] transition-all duration-300';
    }
    return 'hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02] transition-all duration-300';
  };

  const getGradientClass = (type: 'bg' | 'text' | 'border' = 'bg') => {
    if (theme === 'light') {
      if (type === 'bg') return 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
      if (type === 'text') return 'bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent';
      return 'border-gray-200';
    }
    if (theme === 'elegant') {
      if (type === 'bg') return 'bg-gradient-to-br from-[#faf8f3] via-[#f5f1e8] via-[#f0ebe0] to-[#ede5d8]';
      if (type === 'text') return 'bg-gradient-to-r from-[#2d1b0e] via-[#4a3a2a] to-[#6a5a4a] bg-clip-text text-transparent';
      return 'border-[#e8ddd0]';
    }
    if (theme === 'fashion') {
      if (type === 'bg') return 'bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#ede9fe]';
      if (type === 'text') return 'bg-gradient-to-r from-[#581c87] to-[#7c3aed] bg-clip-text text-transparent';
      return 'border-[#e9d5ff]';
    }
    if (type === 'bg') return 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950';
    if (type === 'text') return 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent';
    return 'border-white/10';
  };

  return {
    theme,
    getTextColor,
    getBgColor,
    getBorderColor,
    getGlassPanelClass,
    getShadowClass,
    getHoverEffect,
    getGradientClass,
  } as const;
};

