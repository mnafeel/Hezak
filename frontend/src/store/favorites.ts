import { create } from 'zustand';
import type { Product } from '../types';

const STORAGE_KEY = 'favorites-storage';

// Helper to get available products (for filtering)
let getAvailableProducts: (() => Product[]) | null = null;

export const setProductsGetter = (getter: () => Product[]) => {
  getAvailableProducts = getter;
};

// Load favorites from localStorage
const loadFavorites = (): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save favorites to localStorage
const saveFavorites = (favorites: number[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Ignore localStorage errors
  }
};

interface FavoritesState {
  favorites: number[]; // Array of product IDs
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => void;
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  clearFavorites: () => void;
  getFavoriteCount: () => number;
  getAvailableFavoriteCount: () => number;
  getAvailableFavorites: () => Product[];
  cleanupInvalidFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: loadFavorites(),
  
  isFavorite: (productId: number) => {
    return get().favorites.includes(productId);
  },
  
  toggleFavorite: (product: Product) => {
    const { favorites, isFavorite } = get();
    let newFavorites: number[];
    if (isFavorite(product.id)) {
      newFavorites = favorites.filter((id) => id !== product.id);
    } else {
      newFavorites = [...favorites, product.id];
    }
    set({ favorites: newFavorites });
    saveFavorites(newFavorites);
  },
  
  addFavorite: (product: Product) => {
    const { favorites } = get();
    if (!favorites.includes(product.id)) {
      const newFavorites = [...favorites, product.id];
      set({ favorites: newFavorites });
      saveFavorites(newFavorites);
    }
  },
  
  removeFavorite: (productId: number) => {
    const newFavorites = get().favorites.filter((id) => id !== productId);
    set({ favorites: newFavorites });
    saveFavorites(newFavorites);
  },
  
  clearFavorites: () => {
    set({ favorites: [] });
    saveFavorites([]);
  },
  
  getFavoriteCount: () => {
    return get().favorites.length;
  },
  
  getAvailableFavoriteCount: () => {
    if (!getAvailableProducts) return get().favorites.length;
    const availableProducts = getAvailableProducts();
    const availableProductIds = new Set(availableProducts.map((p) => p.id));
    return get().favorites.filter((id) => availableProductIds.has(id)).length;
  },
  
  getAvailableFavorites: () => {
    if (!getAvailableProducts) return [];
    const availableProducts = getAvailableProducts();
    const availableProductIds = new Set(availableProducts.map((p) => p.id));
    const favoriteIds = get().favorites.filter((id) => availableProductIds.has(id));
    return availableProducts.filter((p) => favoriteIds.includes(p.id));
  },
  
  cleanupInvalidFavorites: () => {
    if (!getAvailableProducts) return;
    const availableProducts = getAvailableProducts();
    const availableProductIds = new Set(availableProducts.map((p) => p.id));
    const validFavorites = get().favorites.filter((id) => availableProductIds.has(id));
    
    if (validFavorites.length !== get().favorites.length) {
      set({ favorites: validFavorites });
      saveFavorites(validFavorites);
    }
  }
}));

