import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';

export const useProducts = (categorySlug?: string) => {
  return useQuery<Product[]>({
    queryKey: ['products', categorySlug ?? 'all'],
    queryFn: async () => {
      console.log('🔄 useProducts: fetching products with categorySlug:', categorySlug);
      try {
        const data = await fetchProducts(categorySlug);
        console.log('✅ useProducts: received data:', { 
          isArray: Array.isArray(data), 
          length: Array.isArray(data) ? data.length : 0,
          firstProduct: Array.isArray(data) && data.length > 0 ? { 
            id: data[0].id, 
            name: data[0].name,
            hasCategory: !!data[0].category,
            categoryId: data[0].category?.id
          } : null,
          rawData: data
        });
        if (!Array.isArray(data)) {
          console.warn('⚠️ useProducts: fetchProducts returned non-array:', data);
          return [];
        }
        return data;
      } catch (error) {
        console.error('❌ useProducts: Error in queryFn:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        return [];
      }
    },
    initialData: [],
    retry: 2,
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale to force refetch
    gcTime: 0 // Don't cache to ensure fresh data
  });
};

