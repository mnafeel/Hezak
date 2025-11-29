import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '../lib/api';

export const useUserOrders = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['user', 'orders'],
    queryFn: fetchUserOrders,
    enabled: isAuthenticated
  });
};

