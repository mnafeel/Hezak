import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/store/HomePage';
import ShopPage from './pages/store/ShopPage';
import CheckoutPage from './pages/store/CheckoutPage';
import ProductDetailPage from './pages/store/ProductDetailPage';
import LoginPage from './pages/store/LoginPage';
import ProfilePage from './pages/store/ProfilePage';
import MyOrdersPage from './pages/store/MyOrdersPage';
import CartPage from './pages/store/CartPage';
import FavoritesPage from './pages/store/FavoritesPage';
import AccountPage from './pages/store/AccountPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminBannersPage from './pages/admin/AdminBannersPage';
import { useAdminPath } from './hooks/useAdminPath';
import { useAdminAuthStore } from './store/adminAuth';
import { useMemo } from 'react';

const AdminSlugGuard = () => {
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const { data, isLoading, isError } = useAdminPath();

  // Use placeholder data or fallback to 'admin' if still loading
  const adminPath = data?.adminPath ?? 'admin';

  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Checking access…
      </div>
    );
  }

  // If we have data and the slug doesn't match, redirect to correct path
  if (!isLoading && data && adminSlug && adminSlug !== adminPath) {
    return <Navigate to={`/${adminPath}`} replace />;
  }

  // If error and slug doesn't match admin, redirect to home
  if (!isLoading && isError && adminSlug && adminSlug !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If slug matches or we're using default 'admin', allow access
  if (!adminSlug || adminSlug === adminPath || (adminSlug === 'admin' && (!data || isError))) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};

const AdminGuard = () => {
  const token = useAdminAuthStore((state) => state.token);
  const { adminSlug } = useParams<{ adminSlug: string }>();
  const { data, isLoading } = useAdminPath();

  const targetSlug = useMemo(() => {
    // If we have data, use it; otherwise use the current slug or default to 'admin'
    if (data?.adminPath) {
      return data.adminPath;
    }
    return adminSlug ?? 'admin';
  }, [data, adminSlug]);

  // Wait for path data to load before redirecting
  if (isLoading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Loading…
      </div>
    );
  }

  // If slug doesn't match the admin path, redirect to correct path
  if (data?.adminPath && adminSlug && adminSlug !== data.adminPath) {
    return <Navigate to={`/${data.adminPath}/login`} replace />;
  }

  return token ? <Outlet /> : <Navigate to={`/${targetSlug}/login`} replace />;
};

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<MyOrdersPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="account" element={<AccountPage />} />
        </Route>

        <Route path="/:adminSlug" element={<AdminSlugGuard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route element={<AdminGuard />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="banners" element={<AdminBannersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
};

export default App;

