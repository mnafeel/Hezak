import { useQuery } from '@tanstack/react-query';
import { fetchAdminUsers, fetchAdminUser } from '../lib/api';
import type { AdminUser } from '../types';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers
  });
};

export const useAdminUser = (id: number | null) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => (id ? fetchAdminUser(id) : Promise.resolve(null)),
    enabled: !!id
  });
};


