import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';

export const useProducts = (categorySlug?: string) => {
  return useQuery<Product[]>({
    queryKey: ['products', categorySlug ?? 'all'],
    queryFn: async () => {
      const data = await fetchProducts(categorySlug);
      return Array.isArray(data) ? data : [];
    },
    initialData: []
  });
};

