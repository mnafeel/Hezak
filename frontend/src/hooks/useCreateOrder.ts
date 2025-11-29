import { useMutation } from '@tanstack/react-query';
import { createOrder } from '../lib/api';
import type { CreateOrderPayload, Order } from '../types';

export const useCreateOrder = () => {
  return useMutation<Order, Error, CreateOrderPayload>({
    mutationFn: createOrder
  });
};


