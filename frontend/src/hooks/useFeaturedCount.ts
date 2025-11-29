import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFeaturedCount, updateFeaturedCount } from '../lib/api';

export const FEATURED_COUNT_QUERY_KEY = ['settings', 'featuredCount'] as const;

export const useFeaturedCount = () => {
  const query = useQuery({
    queryKey: FEATURED_COUNT_QUERY_KEY,
    queryFn: fetchFeaturedCount,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    placeholderData: { featuredCount: 3 }
  });
  
  return {
    ...query,
    data: query.data?.featuredCount ?? 3
  };
};

export const useUpdateFeaturedCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFeaturedCount,
    onSuccess: (data) => {
      queryClient.setQueryData(FEATURED_COUNT_QUERY_KEY, data);
    }
  });
};

