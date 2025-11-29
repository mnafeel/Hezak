import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';

export const useProducts = (categorySlug?: string) => {
  return useQuery({
    queryKey: ['products', categorySlug ?? 'all'],
    queryFn: () => fetchProducts(categorySlug)
  });
};

