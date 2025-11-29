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
  const response = await apiClient.get<Product[]>('/products', {
    params: category ? { category } : undefined
  });
  return response.data;
};

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
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
    // Parse textElements from JSON if needed
    return response.data.map(banner => ({
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
    throw error;
  }
};

export const fetchActiveBanners = async (): Promise<Banner[]> => {
  const response = await apiClient.get<any[]>('/banners/active');
  // Parse textElements from JSON if needed
  return response.data.map(banner => ({
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

