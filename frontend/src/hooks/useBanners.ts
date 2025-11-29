import { useQuery } from '@tanstack/react-query';
import { fetchBanners, fetchActiveBanners } from '../lib/api';
import type { Banner } from '../types';

export const useBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['admin', 'banners'],
    queryFn: fetchBanners,
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    staleTime: 30000 // 30 seconds
  });
};

export const useActiveBanners = () => {
  return useQuery<Banner[]>({
    queryKey: ['banners', 'active'],
    queryFn: fetchActiveBanners,
    retry: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
    staleTime: 30000 // 30 seconds
  });
};

