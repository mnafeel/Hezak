import axios, { AxiosHeaders, type AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '../store/adminAuth';
import { useUserAuthStore } from '../store/userAuth';
import { getErrorMessage } from './errorHandler';

// Use environment variable for production, fallback to /api for development (Vite proxy)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  const adminToken = useAdminAuthStore.getState().token;
  const userToken = useUserAuthStore.getState().token;
  
  // Use the appropriate token based on the endpoint
  let token: string | null = null;
  
  if (url.startsWith('/admin/')) {
    // Admin endpoints - use admin token
    token = adminToken;
  } else if (url.startsWith('/orders/me') || url.startsWith('/auth/')) {
    // User endpoints - use user token
    token = userToken;
  } else {
    // For other endpoints, prefer user token, fallback to admin token
    token = userToken || adminToken;
  }
  
  if (token) {
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors (server not reachable)
    if (!error.response) {
      console.error('Network Error - Server may be down:', {
        url: error.config?.url,
        method: error.config?.method,
        message: error.message
      });
      
      // Check if it's a connection error
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        const errorMessage = 'Cannot connect to server. Please ensure the backend server is running.';
        toast.error(errorMessage);
        return Promise.reject(new Error(errorMessage));
      }
    }
    
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Only clear the relevant auth store based on the endpoint
      if (url.startsWith('/admin/')) {
        // Admin endpoint - clear admin auth only
        useAdminAuthStore.getState().clearAuth();
      } else if (url.startsWith('/orders/me') || url.startsWith('/auth/')) {
        // User endpoint - clear user auth only
        useUserAuthStore.getState().clearAuth();
      } else {
        // For other endpoints, clear both (fallback)
        // But don't clear if it's a public endpoint that might return 401
        const publicEndpoints = ['/products', '/categories'];
        const isPublicEndpoint = publicEndpoints.some(ep => url.startsWith(ep));
        
        if (!isPublicEndpoint) {
          useAdminAuthStore.getState().clearAuth();
          useUserAuthStore.getState().clearAuth();
        }
      }
    }
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: getErrorMessage(error),
      code: error.code
    });
    
    return Promise.reject(error);
  }
);

