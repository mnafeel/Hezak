import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../lib/api';
import type { Category } from '../types';

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await fetchCategories();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 0, // Always refetch to ensure new categories appear immediately
    refetchOnWindowFocus: true, // Refetch when user returns to the tab
    initialData: []
  });
};

