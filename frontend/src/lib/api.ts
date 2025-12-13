import { apiClient } from './apiClient';
import type {
  AdminOverview,
  AdminUser,
  Banner,
  BannerFormPayload,
  Category,
  CategoryFormPayload,
  CreateOrderPayload,
  Order,
  Product,
  ProductFormPayload,
  SiteSettings,
  UploadImageResponse
} from '../types';

export const fetchProducts = async (category?: string): Promise<Product[]> => {
  const url = '/products';
  const params = category ? { category } : undefined;
  const fullUrl = `${apiClient.defaults.baseURL}${url}${params ? `?category=${params.category}` : ''}`;
  
  console.log('🌐 fetchProducts CALLED:', { 
    url, 
    category, 
    params,
    baseURL: apiClient.defaults.baseURL,
    fullUrl,
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack
  });
  
  try {
    let response;
    try {
      console.log('📡 fetchProducts: Making API request...', { fullUrl });
      response = await apiClient.get<Product[]>(url, { params });
      console.log('✅ fetchProducts: API call successful', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array'
      });
    } catch (apiError) {
      console.error('❌ fetchProducts: API call failed:', apiError);
      if (apiError && typeof apiError === 'object' && 'response' in apiError) {
        const axiosError = apiError as any;
        console.error('API Error Details:', {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            baseURL: axiosError.config?.baseURL,
            fullURL: axiosError.config?.baseURL ? `${axiosError.config.baseURL}${axiosError.config.url}` : axiosError.config?.url
          },
          message: axiosError.message,
          code: axiosError.code
        });
      } else if (apiError && typeof apiError === 'object' && 'message' in apiError) {
        console.error('Network Error:', {
          message: (apiError as any).message,
          code: (apiError as any).code
        });
      }
      throw apiError;
    }
    
    const data = response.data;
    
    console.log('📥 fetchProducts response received:', { 
      category, 
      status: response.status,
      statusText: response.statusText,
      dataLength: Array.isArray(data) ? data.length : 'not array',
      dataType: typeof data,
      isArray: Array.isArray(data),
      rawData: data,
      firstItem: Array.isArray(data) && data.length > 0 ? { 
        id: data[0].id, 
        name: data[0].name,
        hasCategory: !!data[0].category,
        categoryId: data[0].category?.id,
        categoryIdType: typeof data[0].category?.id,
        categoriesCount: Array.isArray(data[0].categories) ? data[0].categories.length : 0,
        fullProduct: data[0]
      } : null,
      fullResponse: Array.isArray(data) && data.length > 0 ? data.slice(0, 2) : data
    });
    
    if (!Array.isArray(data)) {
      console.warn('⚠️ fetchProducts: response.data is not an array:', {
        data,
        dataType: typeof data,
        constructor: data?.constructor?.name
      });
      return [];
    }
    
    // Validate products before returning
    const validProducts = data.filter((product): product is Product => {
      // Check if product exists and has required fields
      if (!product) {
        console.warn('⚠️ Invalid product filtered out: null/undefined');
        return false;
      }
      
      // Check ID - can be number or string that can be converted to number
      const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
      if (!productId || (typeof productId === 'number' && (isNaN(productId) || productId <= 0))) {
        console.warn('⚠️ Invalid product filtered out: invalid ID', { id: product.id, productId });
        return false;
      }
      
      // Check name
      if (!product.name || typeof product.name !== 'string' || product.name.trim() === '') {
        console.warn('⚠️ Invalid product filtered out: invalid name', { id: product.id, name: product.name });
        return false;
      }
      
      return true;
    });
    
    if (validProducts.length !== data.length) {
      console.warn(`⚠️ Filtered out ${data.length - validProducts.length} invalid products`);
    }
    
    console.log('✅ fetchProducts returning:', {
      total: validProducts.length,
      originalCount: data.length,
      filteredOut: data.length - validProducts.length,
      firstProduct: validProducts.length > 0 ? {
        id: validProducts[0].id,
        name: validProducts[0].name,
        hasCategory: !!validProducts[0].category,
        categoryId: validProducts[0].category?.id
      } : null,
      allProductIds: validProducts.map(p => p.id).slice(0, 5)
    });
    
    if (validProducts.length === 0 && data.length > 0) {
      console.error('❌ All products were filtered out!', {
        originalData: data.slice(0, 2),
        reasons: data.map((p, i) => ({
          index: i,
          hasId: !!p?.id,
          id: p?.id,
          idType: typeof p?.id,
          hasName: !!p?.name,
          name: p?.name,
          nameType: typeof p?.name
        }))
      });
    }
    
    return validProducts;
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Log axios error details if available
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      console.error('Axios error response:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data
      });
    }
    return [];
  }
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<Category[]>('/categories');
    const data = response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchAdminCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories', {
    params: { includeProducts: true }
  });
  return response.data;
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await apiClient.post<Order>('/orders', payload);
  return response.data;
};

export const adminLogin = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<{ token: string }>('/admin/login', payload);
  return response.data;
};

export const userRegister = async (payload: { name: string; email: string; password: string; phone?: string }) => {
  const response = await apiClient.post<{ user: { id: number; name: string; email: string; phone?: string | null }; token: string }>('/auth/register', payload);
  return response.data;
};

export const userLogin = async (payload: { email: string; password: string }) => {
  const response = await apiClient.post<{ user: { id: number; name: string; email: string; phone?: string | null }; token: string }>('/auth/login', payload);
  return response.data;
};

export const googleLogin = async (payload: { idToken: string }) => {
  const response = await apiClient.post<{ user: { id: number; name: string; email: string; phone?: string | null }; token: string }>('/auth/google', payload);
  return response.data;
};

export const updateUserProfile = async (payload: { name: string; phone?: string | null }) => {
  const response = await apiClient.put<{ user: { id: number; name: string; email: string; phone?: string | null } }>('/auth/profile', payload);
  return response.data;
};

export const fetchAdminOverview = async (): Promise<AdminOverview> => {
  const response = await apiClient.get<AdminOverview>('/admin/reports/overview');
  return response.data;
};

export const fetchAdminOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/orders');
  return response.data;
};

export const updateOrder = async (id: number, payload: { status?: Order['status']; trackingId?: string | null; courierCompany?: string | null; trackingLink?: string | null }) => {
  const response = await apiClient.put<Order>(`/orders/${id}`, payload);
  return response.data;
};

export const fetchUserOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>('/orders/me');
  return response.data;
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>('/admin/users');
  return response.data;
};

export const fetchAdminUser = async (id: number): Promise<AdminUser> => {
  const response = await apiClient.get<AdminUser>(`/admin/users/${id}`);
  return response.data;
};

export const createProduct = async (payload: ProductFormPayload) => {
  const response = await apiClient.post<Product>('/products', payload);
  return response.data;
};

export const updateProduct = async (
  id: number,
  payload: Partial<ProductFormPayload>
) => {
  const response = await apiClient.put<Product>(`/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await apiClient.delete(`/products/${id}`);
};

export const createCategory = async (payload: CategoryFormPayload) => {
  const response = await apiClient.post<Category>('/categories', payload);
  return response.data;
};

export const updateCategory = async (
  id: number,
  payload: Partial<CategoryFormPayload>
) => {
  const response = await apiClient.put<Category>(`/categories/${id}`, payload);
  return response.data;
};

export const deleteCategory = async (id: number) => {
  await apiClient.delete(`/categories/${id}`);
};

export const updateCategoryProducts = async (
  id: number,
  productIds: number[]
): Promise<Category> => {
  const response = await apiClient.put<Category>(`/categories/${id}/products`, {
    productIds
  });
  return response.data;
};

export const fetchAdminPath = async (): Promise<{ adminPath: string }> => {
  const response = await apiClient.get<{ adminPath: string }>('/settings/admin-path');
  return response.data;
};

export const updateAdminPath = async (payload: { adminPath: string }) => {
  const response = await apiClient.put<{ adminPath: string }>('/settings/admin-path', payload);
  return response.data;
};

export const fetchFeaturedCount = async (): Promise<{ featuredCount: number }> => {
  const response = await apiClient.get<{ featuredCount: number }>('/settings/featured-count');
  return response.data;
};

export const updateFeaturedCount = async (payload: { featuredCount: number }) => {
  const response = await apiClient.put<{ featuredCount: number }>('/settings/featured-count', payload);
  return response.data;
};

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<UploadImageResponse>('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const uploadVideo = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<UploadImageResponse>('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Banner API functions
export const fetchBanners = async (): Promise<Banner[]> => {
  try {
    const response = await apiClient.get<any[]>('/banners');
    const data = response.data;
    if (!Array.isArray(data)) return [];
    // Parse textElements from JSON if needed
    return data.map(banner => ({
      ...banner,
      textElements: (() => {
        if (Array.isArray(banner.textElements)) {
          return banner.textElements;
        }
        if (typeof banner.textElements === 'string' && banner.textElements.trim()) {
          try {
            return JSON.parse(banner.textElements);
          } catch {
            return [];
          }
        }
        return [];
      })()
    }));
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

export const fetchActiveBanners = async (): Promise<Banner[]> => {
  try {
    const response = await apiClient.get<any[]>('/banners/active');
    const data = response.data;
    if (!Array.isArray(data)) return [];
    // Parse textElements from JSON if needed
    return data.map(banner => ({
      ...banner,
      textElements: (() => {
        if (Array.isArray(banner.textElements)) {
          return banner.textElements;
        }
        if (typeof banner.textElements === 'string' && banner.textElements.trim()) {
          try {
            return JSON.parse(banner.textElements);
          } catch {
            return [];
          }
        }
        return [];
      })()
    }));
  } catch (error) {
    console.error('Error fetching active banners:', error);
    return [];
  }
};

export const createBanner = async (payload: BannerFormPayload): Promise<Banner> => {
  const response = await apiClient.post<Banner>('/banners', payload);
  return response.data;
};

export const updateBanner = async (id: number, payload: Partial<BannerFormPayload>): Promise<Banner> => {
  const response = await apiClient.put<any>(`/banners/${id}`, payload);
  // Parse textElements from JSON if needed
  const banner = response.data;
  return {
    ...banner,
    textElements: (() => {
      if (Array.isArray(banner.textElements)) {
        return banner.textElements;
      }
      if (typeof banner.textElements === 'string' && banner.textElements.trim()) {
        try {
          return JSON.parse(banner.textElements);
        } catch {
          return [];
        }
      }
      return [];
    })()
  };
};

export const deleteBanner = async (id: number): Promise<void> => {
  await apiClient.delete(`/banners/${id}`);
};

export const reorderBanners = async (banners: Array<{ id: number; order: number }>): Promise<Banner[]> => {
  const response = await apiClient.post<Banner[]>('/banners/reorder', { banners });
  return response.data;
};

// Site Settings API functions
export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const response = await apiClient.get<SiteSettings>('/site-settings');
  return response.data;
};

export const updateSiteSettings = async (payload: Partial<SiteSettings>): Promise<SiteSettings> => {
  const response = await apiClient.put<SiteSettings>('/site-settings', payload);
  return response.data;
};

