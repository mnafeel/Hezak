import { useQuery } from '@tanstack/react-query';
import { fetchBanners, fetchActiveBanners } from '../lib/api';
import type { Banner } from '../types';

export const useBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      const data = await fetchBanners();
      return Array.isArray(data) ? data : [];
    },
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Use cached data if available (faster loading)
    staleTime: 60 * 1000, // Consider data fresh for 60 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    initialData: []
  });
};

