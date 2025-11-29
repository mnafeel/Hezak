import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => fetchProducts()
  });
};


