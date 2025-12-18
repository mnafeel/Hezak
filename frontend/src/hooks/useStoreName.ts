import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStoreName, updateStoreName } from '../lib/api';
import { toast } from 'react-hot-toast';

export const useStoreName = () => {
  return useQuery({
    queryKey: ['storeName'],
    queryFn: fetchStoreName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

export const useUpdateStoreName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeName: string) => updateStoreName(storeName),
    onSuccess: (data) => {
      queryClient.setQueryData(['storeName'], data);
      queryClient.invalidateQueries({ queryKey: ['storeName'] });
      toast.success('Store name updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update store name');
    }
  });
};

