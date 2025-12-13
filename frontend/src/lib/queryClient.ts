import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Changed to true for better data freshness
      staleTime: 0, // Changed to 0 - let individual queries control their stale time
      retry: 2, // Default retry count
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      refetchOnMount: true, // Always refetch on mount
      refetchOnReconnect: true // Refetch when network reconnects
    }
  }
});


