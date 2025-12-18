import { useQuery } from '@tanstack/react-query';
import { fetchBanners, fetchActiveBanners } from '../lib/api';
import type { Banner } from '../types';

export const useBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      console.log('🔄 Fetching banners from API...');
      const data = await fetchBanners();
      console.log('✅ Banners fetched:', { count: Array.isArray(data) ? data.length : 0, data });
      return Array.isArray(data) ? data : [];
    },
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 0, // Always consider data stale - refetch immediately
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
    initialData: []
  });
};

export const useActiveBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['banners', 'active'],
    queryFn: async () => {
      const data = await fetchActiveBanners();
      return Array.isArray(data) ? data : [];
    },
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
    initialData: []
  });
};

