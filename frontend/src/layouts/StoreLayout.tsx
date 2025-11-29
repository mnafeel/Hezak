import { useState, useEffect, useLayoutEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCartStore } from '../store/cart';
import { useFavoritesStore } from '../store/favorites';
import { useUserAuthStore } from '../store/userAuth';
import { useCategories } from '../hooks/useCategories';
import { useThemeStore, applyTheme } from '../store/theme';
import { useThemeColors } from '../hooks/useThemeColors';
import { formatCurrency, cn } from '../lib/utils';
import CartSidebar from '../components/shared/CartSidebar';
import FavoritesSidebar from '../components/shared/FavoritesSidebar';

const StoreLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.total());
  const shouldOpenCart = useCartStore((state) => state.shouldOpenCart);
  const setShouldOpenCart = useCartStore((state) => state.setShouldOpenCart);
  const favoriteCount = useFavoritesStore((state) => state.getAvailableFavoriteCount());
  const { data: categories = [] } = useCategories();
  const topSellingCategories = categories.filter((cat) => cat.isTopSelling);
  const user = useUserAuthStore((state) => state.user);
  const clearAuth = useUserAuthStore((state) => state.clearAuth);
  const theme = useThemeStore((state) => state.theme);
  const { getTextColor, getBorderColor, getGlassPanelClass, getHoverEffect, getShadowClass } = useThemeColors();

  // Apply theme synchronously before browser paint to prevent blank page
  useLayoutEffect(() => {
    // Only apply theme if we're in the store (not admin)
    // This ensures admin pages always stay dark
    if (typeof window !== 'undefined' && document.documentElement) {
      try {
        // Apply theme immediately
        const themeToApply = theme || 'dark';
        applyTheme(themeToApply);
      } catch (error) {
        console.error('Error applying theme:', error);
        // Fallback to dark theme if there's an error
        try {
          applyTheme('dark');
        } catch (fallbackError) {
          console.error('Error applying fallback theme:', fallbackError);
        }
      }
    }
  }, [theme]);

  // Also apply theme on mount (in case useLayoutEffect didn't catch it)
  useEffect(() => {
    if (typeof window !== 'undefined' && document.documentElement) {
      try {
        const themeToApply = theme || 'dark';
        applyTheme(themeToApply);
      } catch (error) {
        // Silently fail, useLayoutEffect should have handled it
      }
    }
  }, [theme]);

  // Close sidebars when navigating to a different page/tab
  useEffect(() => {
    setCartOpen(false);
    setFavoritesOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const onCartClick = () => {
    setShouldOpenCart(true);
  };

  const onFavoritesClick = () => {
    setFavoritesOpen(true);
  };

  // Sync cart open state with shouldOpenCart from store
  const cartOpen = shouldOpenCart;
  const setCartOpen = (open: boolean) => {
    setShouldOpenCart(open);
  };

  // Sort categories: top selling first, then alphabetically
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.isTopSelling && !b.isTopSelling) return -1;
    if (!a.isTopSelling && b.isTopSelling) return 1;
    return a.name.localeCompare(b.name);
  });

  // Get theme classes based on current theme
  const getThemeClasses = () => {
    const currentTheme = theme || 'dark';
    switch (currentTheme) {
      case 'light':
        return 'min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 pb-16 md:pb-0';
      case 'elegant':
        return 'min-h-screen bg-gradient-to-b from-[#faf8f3] via-[#f5f1e8] via-[#f0ebe0] to-[#ede5d8] pb-16 md:pb-0';
      case 'fashion':
        return 'min-h-screen bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#ede9fe] pb-16 md:pb-0';
      case 'blue':
        return 'min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 pb-16 md:pb-0';
      case 'purple':
        return 'min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-purple-950 pb-16 md:pb-0';
      case 'green':
        return 'min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-green-950 pb-16 md:pb-0';
      case 'dark':
      default:
        return 'min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16 md:pb-0';
    }
  };

  // Check if we're on the login page - render full screen without header/nav
  const isLoginPage = location.pathname === '/login';

  // If login page, render full screen without layout constraints
  if (isLoginPage) {
    return (
      <div className={getThemeClasses()}>
        <Outlet />
      </div>
    );
  }

  return (
    <div className={getThemeClasses()}>
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 sm:gap-6 md:gap-8 px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:py-8">
        {/* Header */}
        <header className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className={`flex items-center gap-2 sm:gap-3 ${getTextColor('primary')}`}>
              <div className={`rounded-full ${theme === 'light' ? 'bg-gray-200/80' : theme === 'elegant' ? 'bg-[#f5f1e8]/90 border border-[#ddd4c4]' : theme === 'fashion' ? 'bg-[#f3e8ff]/90 border border-[#d8b4fe]' : 'bg-white/10'} p-2 sm:p-3 ${getShadowClass('lg')}`}>
                <span className={`font-display text-lg sm:text-xl ${theme === 'light' ? 'text-gray-900' : theme === 'elegant' ? 'text-[#3d2817]' : theme === 'fashion' ? 'text-[#581c87]' : 'text-white'}`}>H</span>
              </div>
              <div>
                <p className={`font-display text-xl sm:text-2xl font-semibold ${getTextColor('primary')}`}>Hezak Boutique</p>
                <p className={`text-xs sm:text-sm ${getTextColor('secondary')} hidden sm:block`}>Premium lifestyle curation</p>
              </div>
            </Link>
            {/* Desktop Header Actions - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-3">
              {/* Login Button - Only show when not logged in */}
              {!user && (
                <Link
                  to="/login"
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Login
                </Link>
              )}
              
              {/* Favorites Button - Only show when logged in */}
              {user && (
                <button
                  type="button"
                  onClick={onFavoritesClick}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${getTextColor('primary')} ${getGlassPanelClass()} ${getHoverEffect()}`}
                  aria-label="Favorites"
                  title="Favorites"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {favoriteCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {favoriteCount}
                    </span>
                  )}
                </button>
              )}
              
              {/* Cart Button - Only show when logged in */}
              {user && (
                <button
                  type="button"
                  onClick={onCartClick}
                  className={`relative flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold ${getTextColor('primary')} ${getGlassPanelClass()} ${getHoverEffect()}`}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                      {cartItems.length}
                    </span>
                  )}
                  {cartTotal > 0 && (
                    <span className="text-brand-200">{formatCurrency(cartTotal)}</span>
                  )}
                </button>
              )}

              {/* Profile Button - Only show when logged in */}
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm ${getTextColor('primary')} ${getGlassPanelClass()} ${getHoverEffect()}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold">{user.name}</span>
                    <svg
                      className={`h-4 w-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileMenuOpen(false)}
                      />
                      <div className={`absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border ${theme === 'light' ? 'border-gray-300 bg-white' : theme === 'elegant' ? 'border-[#ddd4c4] bg-[#faf8f3]' : theme === 'fashion' ? 'border-[#d8b4fe] bg-[#faf5ff]' : 'border-white/10 bg-slate-900'} shadow-2xl`}>
                        <div className="p-2">
                          <Link
                            to="/profile"
                            onClick={() => setProfileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${getTextColor('primary')} transition ${theme === 'light' ? 'hover:bg-gray-100' : theme === 'elegant' ? 'hover:bg-[#f5f1e8]' : theme === 'fashion' ? 'hover:bg-[#f3e8ff]' : 'hover:bg-white/10'}`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Profile</span>
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setProfileMenuOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${getTextColor('primary')} transition ${theme === 'light' ? 'hover:bg-gray-100' : theme === 'elegant' ? 'hover:bg-[#f5f1e8]' : theme === 'fashion' ? 'hover:bg-[#f3e8ff]' : 'hover:bg-white/10'}`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>My Orders</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              handleLogout();
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition ${theme === 'light' ? 'hover:bg-red-100' : theme === 'elegant' ? 'hover:bg-red-50/50' : 'hover:bg-red-500/10'}`}
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation: Home, All Collections - Hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1 border-b border-white/10">
            <NavLink
              to="/"
                  className={({ isActive }) =>
                cn(
                  'px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? `border-b-2 border-brand-400 ${getTextColor('primary')}`
                    : `${getTextColor('tertiary')} hover:${getTextColor('primary')}`
                )
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/shop"
                  className={({ isActive }) =>
                cn(
                  'px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? `border-b-2 border-brand-400 ${getTextColor('primary')}`
                    : `${getTextColor('tertiary')} hover:${getTextColor('primary')}`
                )
              }
            >
              Collections
            </NavLink>
          </nav>
        </header>

        {/* Mobile Category Menu - Only show on shop page */}
        {location.pathname === '/shop' && (
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-full rounded-xl border ${getBorderColor()} px-4 py-3 text-left text-sm font-medium ${getTextColor('primary')} ${getGlassPanelClass()} ${getHoverEffect()}`}
            >
              <div className="flex items-center justify-between">
                <span>Browse Categories</span>
                <span className={cn('transition-transform', mobileMenuOpen && 'rotate-180')}>▼</span>
              </div>
            </button>
            {mobileMenuOpen && (
              <div className={`mt-2 rounded-xl border ${getBorderColor()} p-4 ${getGlassPanelClass()} ${getShadowClass('md')}`}>
                {categories.length > 0 ? (
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/shop');
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition',
                        location.pathname === '/shop' && !searchParams.get('category')
                          ? `border-brand-400/50 bg-brand-400/10 ${getTextColor('primary')}`
                          : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
                      )}
                    >
                      All Products
                    </button>
                    {sortedCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          navigate(`/shop?category=${category.slug}`);
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          'w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition flex items-center justify-between',
                          location.pathname === '/shop' && searchParams.get('category') === category.slug
                            ? category.isTopSelling
                              ? `border-brand-400 bg-brand-400/20 ${getTextColor('primary')} shadow-lg shadow-brand-400/20`
                              : `border-brand-400/50 bg-brand-400/10 ${getTextColor('primary')}`
                            : category.isTopSelling
                            ? `${theme === 'light' ? 'border-brand-400/30 bg-brand-400/10' : 'border-brand-400/30 bg-brand-400/10'} ${getTextColor('secondary')} hover:bg-brand-400/20 hover:border-brand-400/50`
                            : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {category.isTopSelling && <span className="text-xs">🔥</span>}
                          <span>{category.name}</span>
                        </div>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs font-semibold',
                            category.isTopSelling ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                          )}
                        >
                          {category.productCount}
                        </span>
                      </button>
                    ))}
                  </div>
                    ) : (
                      <div className={`text-xs ${getTextColor('tertiary')}`}>Loading categories...</div>
                    )}
              </div>
            )}
          </div>
        )}

        {/* Main Content Area with Sidebar */}
        <div className="flex flex-1 gap-8">
          {/* Category Sidebar - Desktop - Only show on shop page */}
          {location.pathname === '/shop' && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-8 space-y-4">
                <div className={`rounded-2xl border ${getBorderColor()} p-6 ${getGlassPanelClass()}`}>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${getTextColor('primary')}`}>Categories</h2>
                    <button
                      type="button"
                      onClick={() => navigate('/shop')}
                      className={cn(
                        'text-xs font-medium transition',
                        location.pathname === '/shop' && !searchParams.get('category')
                          ? 'text-brand-300'
                          : `${getTextColor('tertiary')} hover:${getTextColor('primary')}`
                      )}
                    >
                      View All
                    </button>
                  </div>
                  {categories.length > 0 ? (
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => navigate('/shop')}
                        className={cn(
                          'w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition flex items-center justify-between',
                          location.pathname === '/shop' && !searchParams.get('category')
                            ? `border-brand-400/50 bg-brand-400/10 ${getTextColor('primary')}`
                            : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
                        )}
                      >
                        <span>All Products</span>
                      </button>
                      {sortedCategories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => navigate(`/shop?category=${category.slug}`)}
                          className={cn(
                            'w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition flex items-center justify-between',
                            location.pathname === '/shop' && searchParams.get('category') === category.slug
                              ? category.isTopSelling
                                ? `border-brand-400 bg-brand-400/20 ${getTextColor('primary')} shadow-lg shadow-brand-400/20`
                                : `border-brand-400/50 bg-brand-400/10 ${getTextColor('primary')}`
                              : category.isTopSelling
                              ? `${theme === 'light' ? 'border-brand-400/30 bg-brand-400/10' : 'border-brand-400/30 bg-brand-400/10'} ${getTextColor('secondary')} hover:bg-brand-400/20 hover:border-brand-400/50`
                              : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {category.isTopSelling && <span className="text-xs">🔥</span>}
                            <span>{category.name}</span>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-semibold',
                              category.isTopSelling 
                                ? theme === 'light' ? 'bg-gray-300 text-gray-900' : 'bg-white/20 text-white'
                                : theme === 'light' ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-slate-300'
                            )}
                          >
                            {category.productCount}
                          </span>
                        </button>
                      ))}
                    </div>
                    ) : (
                      <div className={`text-xs ${getTextColor('tertiary')}`}>Loading categories...</div>
                    )}
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-16">
            <Outlet />
          </main>
        </div>

        {/* Footer */}
          <footer className={`border-t ${getBorderColor()} py-8 text-sm ${getTextColor('tertiary')}`}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span>© {new Date().getFullYear()} Hezak Boutique. All rights reserved.</span>
            <span>Crafted with passion for exquisite experiences.</span>
          </div>
        </footer>
      </div>
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      
      {/* Favorites Sidebar */}
      <FavoritesSidebar isOpen={favoritesOpen} onClose={() => setFavoritesOpen(false)} />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Home */}
          <NavLink
            to="/"
            onClick={() => {
              setCartOpen(false);
              setFavoritesOpen(false);
            }}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                isActive ? 'text-brand-400' : 'text-slate-400'
              )
            }
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </NavLink>

          {/* Collections/Shop */}
          <NavLink
            to="/shop"
            onClick={() => {
              setCartOpen(false);
              setFavoritesOpen(false);
            }}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                isActive ? 'text-brand-400' : 'text-slate-400'
              )
            }
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-xs font-medium">Collections</span>
          </NavLink>

          {/* Cart - Only show when logged in - Navigate to cart page on mobile */}
          {user && (
            <Link
              to="/cart"
              onClick={() => {
                setCartOpen(false);
                setFavoritesOpen(false);
              }}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                location.pathname === '/cart' || location.pathname === '/checkout' ? 'text-brand-400' : 'text-slate-400'
              )}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Cart</span>
              {cartItems.length > 0 && (
                <span className="absolute -right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Favorites - Only show when logged in - Navigate to favorites page on mobile */}
          {user && (
            <Link
              to="/favorites"
              onClick={() => {
                setCartOpen(false);
                setFavoritesOpen(false);
              }}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                location.pathname === '/favorites' ? 'text-brand-400' : 'text-slate-400'
              )}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-xs font-medium">Favorites</span>
              {favoriteCount > 0 && (
                <span className="absolute -right-1 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {favoriteCount}
                </span>
              )}
            </Link>
          )}

          {/* Login - Only show when not logged in */}
          {!user && (
            <Link
              to="/login"
              onClick={() => {
                setCartOpen(false);
                setFavoritesOpen(false);
              }}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                location.pathname === '/login' ? 'text-brand-400' : 'text-slate-400'
              )}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Login</span>
            </Link>
          )}

          {/* Account - Only show when logged in (replaces Login) - Navigate to account page on mobile */}
          {user && (
            <Link
              to="/account"
              onClick={() => {
                setCartOpen(false);
                setFavoritesOpen(false);
              }}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition',
                (location.pathname === '/account' || location.pathname === '/profile' || location.pathname === '/orders') ? 'text-brand-400' : 'text-slate-400'
              )}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Account</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default StoreLayout;

