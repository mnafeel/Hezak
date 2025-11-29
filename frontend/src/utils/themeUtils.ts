import { useThemeStore } from '../store/theme';

/**
 * Get text color class based on theme
 * This is a utility function that can be used outside of React components
 */
export const getTextColorClass = (type: 'primary' | 'secondary' | 'tertiary' = 'primary', theme?: ReturnType<typeof useThemeStore.getState>['theme']) => {
  const currentTheme = theme || useThemeStore.getState().theme;
  
  if (currentTheme === 'light') {
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


