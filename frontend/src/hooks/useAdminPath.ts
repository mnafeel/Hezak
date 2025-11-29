import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminPath, updateAdminPath } from '../lib/api';

export const ADMIN_PATH_QUERY_KEY = ['settings', 'adminPath'] as const;

export const useAdminPath = () => {
  return useQuery({
    queryKey: ADMIN_PATH_QUERY_KEY,
    queryFn: fetchAdminPath,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    // Fallback to 'admin' if the API fails
    placeholderData: { adminPath: 'admin' }
  });
};

export const useUpdateAdminPath = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminPath,
    onSuccess: async (data) => {
      // Update the cache with new data
      queryClient.setQueryData(ADMIN_PATH_QUERY_KEY, data);
      // Invalidate to ensure fresh data on next access
      await queryClient.invalidateQueries({ queryKey: ADMIN_PATH_QUERY_KEY });
      // Refetch to ensure we have the latest data
      await queryClient.refetchQueries({ queryKey: ADMIN_PATH_QUERY_KEY });
    }
  });
};

