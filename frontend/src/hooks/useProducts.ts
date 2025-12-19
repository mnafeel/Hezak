import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../lib/api';
import type { Product } from '../types';

export const useProducts = (categorySlug?: string) => {
  const queryKey = ['products', categorySlug ?? 'all'];
  
  console.log('🔵 useProducts hook called:', { 
    categorySlug, 
    queryKey,
    timestamp: new Date().toISOString()
  });
  
  const query = useQuery<Product[]>({
    queryKey,
    queryFn: async () => {
      console.log('🔄 useProducts queryFn EXECUTING:', { 
        categorySlug, 
        queryKey,
        timestamp: new Date().toISOString()
      });
      
      try {
        const data = await fetchProducts(categorySlug);
        console.log('✅ useProducts: received data:', { 
          isArray: Array.isArray(data), 
          length: Array.isArray(data) ? data.length : 0,
          firstProduct: Array.isArray(data) && data.length > 0 ? { 
            id: data[0].id, 
            name: data[0].name,
            hasCategory: !!data[0].category,
            categoryId: data[0].category?.id
          } : null,
          rawData: data
        });
        if (!Array.isArray(data)) {
          console.warn('⚠️ useProducts: fetchProducts returned non-array:', data);
          return [];
        }
        return data;
      } catch (error) {
        console.error('❌ useProducts: Error in queryFn:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        // Don't return empty array on error - let React Query handle it
        throw error;
      }
    },
    // Optimize caching for faster category switching
    retry: 2, // Retry 2 times on failure (reduced from 3)
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
    refetchOnMount: false, // Use cached data if available (faster category switching)
    refetchOnReconnect: true, // Refetch when network reconnects
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds (faster category switching)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    enabled: true, // Always enable the query
    placeholderData: undefined // Don't use placeholder data
  });
  
  // Log query state changes
  console.log('📊 useProducts query state:', {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    dataLength: Array.isArray(query.data) ? query.data.length : 'not array',
    error: query.error,
    status: query.status,
    fetchStatus: query.fetchStatus,
    categorySlug
  });
  
  return query;
};

