import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';

export const useProducts = (categorySlug?: string) => {
  return useQuery<Product[]>({
    queryKey: ['products', categorySlug ?? 'all'],
    queryFn: async () => {
      console.log('useProducts: fetching products with categorySlug:', categorySlug);
      const data = await fetchProducts(categorySlug);
      console.log('useProducts: received data:', { 
        isArray: Array.isArray(data), 
        length: Array.isArray(data) ? data.length : 0,
        firstProduct: Array.isArray(data) && data.length > 0 ? { id: data[0].id, name: data[0].name } : null
      });
      if (!Array.isArray(data)) {
        console.warn('useProducts: fetchProducts returned non-array:', data);
        return [];
      }
      return data;
    },
    initialData: [],
    retry: 2,
    refetchOnWindowFocus: true
  });
};

