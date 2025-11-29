import { useQuery } from '@tanstack/react-query';
import { fetchAdminOrders } from '../lib/api';

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: fetchAdminOrders
  });
};


