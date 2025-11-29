import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'blue' | 'purple' | 'green' | 'elegant' | 'fashion';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Apply theme to document
export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-purple', 'theme-green', 'theme-elegant', 'theme-fashion');
  
  // Add new theme class
  root.classList.add(`theme-${theme}`);
  
  // Apply CSS variables based on theme
  switch (theme) {
    case 'light':
      root.style.setProperty('--bg-primary', '#fefefe');
      root.style.setProperty('--bg-secondary', '#f9f9f9');
      root.style.setProperty('--text-primary', '#1a1a1a');
      root.style.setProperty('--text-secondary', '#5a5a5a');
      root.style.setProperty('--border-color', '#e8e8e8');
      root.style.setProperty('--accent-color', '#d4af37');
      break;
    case 'elegant':
      // Premium late color fashion theme - sophisticated champagne, beige, and gold tones
      root.style.setProperty('--bg-primary', '#faf8f3');
      root.style.setProperty('--bg-secondary', '#f5f1e8');
      root.style.setProperty('--text-primary', '#2d1b0e');
      root.style.setProperty('--text-secondary', '#4a3a2a');
      root.style.setProperty('--border-color', '#e8ddd0');
      root.style.setProperty('--accent-color', '#c9a961');
      root.style.setProperty('--accent-gold', '#d4af37');
      root.style.setProperty('--accent-rose', '#d4a574');
      break;
    case 'fashion':
      // Premium fashion theme with soft lavender and rose tones perfect for dress boutique
      root.style.setProperty('--bg-primary', '#faf5ff');
      root.style.setProperty('--bg-secondary', '#f3e8ff');
      root.style.setProperty('--text-primary', '#581c87');
      root.style.setProperty('--text-secondary', '#7c3aed');
      root.style.setProperty('--border-color', '#e9d5ff');
      root.style.setProperty('--accent-color', '#a855f7');
      break;
    case 'blue':
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--border-color', '#334155');
      root.style.setProperty('--accent-color', '#3b82f6');
      break;
    case 'purple':
      root.style.setProperty('--bg-primary', '#1e1b4b');
      root.style.setProperty('--bg-secondary', '#312e81');
      root.style.setProperty('--text-primary', '#f3f4f6');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--border-color', '#4c1d95');
      root.style.setProperty('--accent-color', '#a855f7');
      break;
    case 'green':
      root.style.setProperty('--bg-primary', '#064e3b');
      root.style.setProperty('--bg-secondary', '#065f46');
      root.style.setProperty('--text-primary', '#f0fdf4');
      root.style.setProperty('--text-secondary', '#d1fae5');
      root.style.setProperty('--border-color', '#047857');
      root.style.setProperty('--accent-color', '#10b981');
      break;
    case 'dark':
    default:
      root.style.setProperty('--bg-primary', '#020617');
      root.style.setProperty('--bg-secondary', '#0f172a');
      root.style.setProperty('--text-primary', '#f8fafc');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--border-color', '#1e293b');
      root.style.setProperty('--accent-color', '#8b5cf6');
      break;
  }
};

// Load theme from localStorage
const loadTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  // Always return 'elegant' theme (late color premium design)
  return 'elegant';
};

// Save theme to localStorage
const saveTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme } }));
  } catch {
    // Ignore errors
  }
};

const initialTheme = loadTheme();

export const useThemeStore = create<ThemeState>((set) => {
  // Always use elegant theme (late color premium design) - fixed, no changes allowed
  const elegantTheme: Theme = 'elegant';
  applyTheme(elegantTheme);
  
  return {
    theme: elegantTheme,
    setTheme: () => {
      // Theme is fixed to elegant (late color premium design), no changes allowed
      // This function exists for compatibility but does nothing
    }
  };
});

// Export getState for accessing theme outside of React components
export const getThemeState = () => useThemeStore.getState();

// Don't apply theme on store creation - let components handle it
// This prevents blank pages and ensures theme is only applied to store pages
