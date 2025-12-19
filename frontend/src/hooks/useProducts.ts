import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';

export const useProducts = (categorySlug?: string) => {
  const queryKey = ['products', categorySlug ?? 'all'];
  
  const query = useQuery<Product[]>({
    queryKey,
    queryFn: async () => {
      try {
        const data = await fetchProducts(categorySlug);
        if (!Array.isArray(data)) {
          return [];
        }
        return data;
      } catch (error) {
        // Only log errors in development
        if (import.meta.env.DEV) {
          console.error('Error fetching products:', error);
        }
        throw error;
      }
    },
    // Optimize caching for faster category switching
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Use cached data if available
    refetchOnReconnect: true,
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds (increased from 30)
    gcTime: 5 * 60 * 1000,
    enabled: true,
    placeholderData: undefined
  });
  
  return query;
};

