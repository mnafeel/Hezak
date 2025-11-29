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
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
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

