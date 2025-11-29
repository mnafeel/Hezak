import { useQuery } from '@tanstack/react-query';
import { fetchAdminCategories } from '../lib/api';

export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories
  });
};

