import axios, { AxiosHeaders, type AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { useAdminAuthStore } from '../store/adminAuth';
import { useUserAuthStore } from '../store/userAuth';
import { getErrorMessage } from './errorHandler';

// Use environment variable for production, fallback to /api for development (Vite proxy)
// In production (GitHub Pages), use the full backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://hezak-backend.onrender.com/api' : '/api');

console.log('API Client initialized:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  PROD: import.meta.env.PROD,
  baseURL: API_BASE_URL
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false
});

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';
  const method = config.method?.toLowerCase() || 'get';
  const adminToken = useAdminAuthStore.getState().token;
  const userToken = useUserAuthStore.getState().token;
  
  // Use the appropriate token based on the endpoint
  let token: string | null = null;
  
  // Admin endpoints - always use admin token
  if (url.startsWith('/admin/')) {
    token = adminToken;
  } 
  // Product/Category/Banner mutations require admin auth
  else if (
    (url.startsWith('/products') && (method === 'post' || method === 'put' || method === 'delete')) ||
    (url.startsWith('/categories') && (method === 'post' || method === 'put' || method === 'delete')) ||
    (url.startsWith('/banners') && (method === 'post' || method === 'put' || method === 'delete')) ||
    (url.startsWith('/upload/') && method === 'post') ||
    (url.startsWith('/settings/') && (method === 'put' || method === 'post'))
  ) {
    token = adminToken;
  }
  // User endpoints - use user token
  else if (url.startsWith('/orders/me') || url.startsWith('/auth/')) {
    token = userToken;
  } 
  // For GET requests on public endpoints, no token needed
  // Note: /banners requires admin auth, only /banners/active is public
  else if (method === 'get' && (
    url.startsWith('/products') || 
    url.startsWith('/categories') || 
    url === '/banners/active' || 
    url.startsWith('/banners/active')
  )) {
    token = null; // Public endpoints
  }
  // Admin GET requests to /banners (list all banners) require admin token
  else if (method === 'get' && url.startsWith('/banners') && url !== '/banners/active' && !url.startsWith('/banners/active')) {
    token = adminToken;
  }
  // For other endpoints, prefer user token, fallback to admin token
  else {
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
      const method = error.config?.method?.toLowerCase() || 'get';
      
      // Check if this is an admin endpoint (mutations on products/categories/banners)
      // Note: GET /banners requires admin auth, but GET /banners/active is public
      const isAdminEndpoint = 
        url.startsWith('/admin/') ||
        (url.startsWith('/products') && (method === 'post' || method === 'put' || method === 'delete')) ||
        (url.startsWith('/categories') && (method === 'post' || method === 'put' || method === 'delete')) ||
        ((url.startsWith('/banners') && url !== '/banners/active' && !url.startsWith('/banners/active')) && (method === 'get' || method === 'post' || method === 'put' || method === 'delete')) ||
        (url.startsWith('/upload/') && method === 'post') ||
        (url.startsWith('/settings/') && (method === 'put' || method === 'post'));
      
      if (isAdminEndpoint) {
        // Admin endpoint - clear admin auth and redirect to login
        const adminStore = useAdminAuthStore.getState();
        adminStore.clearAuth();
        
        // Redirect to admin login if we're in admin pages
        if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
          // Get admin path from URL or use default
          const pathParts = window.location.pathname.split('/');
          const adminIndex = pathParts.findIndex(part => part === 'admin');
          const adminSlug = adminIndex > 0 ? pathParts[adminIndex - 1] : 'admin';
          
          toast.error('Your session has expired. Please log in again.');
          setTimeout(() => {
            window.location.href = `/${adminSlug}/login`;
          }, 1000);
        } else {
          // Not in admin page, but got 401 on admin endpoint - show error
          toast.error('You need to be logged in as admin to perform this action.');
        }
      } else if (url.startsWith('/orders/me') || url.startsWith('/auth/')) {
        // User endpoint - clear user auth only
        useUserAuthStore.getState().clearAuth();
      } else {
        // For other endpoints, clear both (fallback)
        // But don't clear if it's a public GET endpoint that might return 401
        // Note: /banners requires admin auth, only /banners/active is public
        const isPublicGet = method === 'get' && (
          url.startsWith('/products') || 
          url.startsWith('/categories') || 
          url === '/banners/active' || 
          url.startsWith('/banners/active')
        );
        
        if (!isPublicGet) {
          useAdminAuthStore.getState().clearAuth();
          useUserAuthStore.getState().clearAuth();
        }
      }
    }
    
    // Log error for debugging
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: getErrorMessage(error),
      code: error.code,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL ? `${error.config.baseURL}${error.config.url}` : error.config?.url
    };
    
    // Log error details in a way that's easier to read
    console.error('API Error:', JSON.stringify(errorDetails, null, 2));
    console.error('Error response data:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    
    // Also log the error stack if available
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    // Show helpful message for common issues
    if (!error.response) {
      console.error('⚠️ Backend server is not reachable. Check:');
      console.error('1. Is backend deployed?');
      console.error('2. Is VITE_API_URL set correctly?');
      console.error('3. Current API URL:', error.config?.baseURL || '/api');
    }
    
    return Promise.reject(error);
  }
);

