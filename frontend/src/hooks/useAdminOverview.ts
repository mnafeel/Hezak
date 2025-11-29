import { useQuery } from '@tanstack/react-query';
import { fetchAdminOverview } from '../lib/api';

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: fetchAdminOverview
  });
};


