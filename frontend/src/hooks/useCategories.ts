import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../lib/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 0, // Always refetch to ensure new categories appear immediately
    refetchOnWindowFocus: true // Refetch when user returns to the tab
  });
};

