import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useFavoritesStore, setProductsGetter } from '../../store/favorites';
import { useCartStore } from '../../store/cart';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useProducts } from '../../hooks/useProducts';
import { formatCurrency, cn } from '../../lib/utils';
import Button from '../ui/Button';

interface FavoritesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const FavoritesSidebar = ({ isOpen, onClose }: FavoritesSidebarProps) => {
  const navigate = useNavigate();
  const user = useUserAuthStore((state) => state.user);
  const favorites = useFavoritesStore((state) => state.favorites);
  const addItem = useCartStore((state) => state.addItem);
  const setShouldOpenCart = useCartStore((state) => state.setShouldOpenCart);
  const { data: allProducts = [] } = useProducts();
  const cleanupInvalidFavorites = useFavoritesStore((state) => state.cleanupInvalidFavorites);
  const { getTextColor, getGlassPanelClass, getShadowClass, getHoverEffect, theme } = useThemeColors();
  
  // Set products getter for favorites store
  useEffect(() => {
    setProductsGetter(() => allProducts);
    // Cleanup invalid favorites when products load
    cleanupInvalidFavorites();
  }, [allProducts, cleanupInvalidFavorites]);
  
  // Get favorited products
  const favoritedProducts = allProducts.filter((product) => favorites.includes(product.id));

  // Check if product has any available inventory (variant-based or general)
  const hasAvailableInventory = (product: typeof favoritedProducts[0]): boolean => {
    // If product has inventory variants, check if any variant has stock
    if (product.inventoryVariants && product.inventoryVariants.length > 0) {
      return product.inventoryVariants.some((variant) => variant.quantity > 0);
    }
    // Fallback to general inventory if no variants
    return product.inventory > 0;
  };

  // Find first available variant (color/size combination with stock)
  const findAvailableVariant = (product: typeof favoritedProducts[0]) => {
    if (product.inventoryVariants && product.inventoryVariants.length > 0) {
      // Find first variant with stock
      const availableVariant = product.inventoryVariants.find((variant) => variant.quantity > 0);
      
      if (availableVariant) {
        // Find matching color and size objects
        const color = product.colors.find((c) => c.name === availableVariant.colorName);
        const size = product.sizes.find((s) => s.name === availableVariant.sizeName);
        return { color: color || null, size: size || null };
      }
    }
    
    // Fallback to default color and size if no variants or no available variant
    return {
      color: product.colors.length > 0 ? product.colors[0] : null,
      size: product.sizes.length > 0 ? product.sizes[0] : null
    };
  };

  const handleAddToCart = (e: React.MouseEvent, product: typeof favoritedProducts[0]) => {
    e.stopPropagation();
    
    // Check if user is logged in
    if (!user) {
      toast.error('Please login to add items to cart');
      onClose();
      navigate('/login');
      return;
    }
    
    // Check if product has any available inventory
    if (!hasAvailableInventory(product)) {
      toast.error('This product is out of stock');
      return;
    }

    // Find available variant or use defaults
    const { color, size } = findAvailableVariant(product);

    addItem(product, {
      color,
      size
    }, 1);

    toast.success(`${product.name} added to cart!`);
    setShouldOpenCart(true); // Open cart sidebar after adding
  };

  const handleProductClick = (productId: number) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-full sm:max-w-md shadow-2xl md:max-w-lg ${
              theme === 'light' || theme === 'elegant' || theme === 'fashion'
                ? theme === 'fashion'
                  ? 'bg-gradient-to-b from-[#faf5ff] via-[#f3e8ff] to-[#ede9fe]'
                  : theme === 'elegant'
                  ? 'bg-gradient-to-b from-[#faf8f3] via-[#f5f1e8] to-[#f0ebe0]'
                  : 'bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50'
                : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
            }`}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className={`flex items-center justify-between border-b ${theme === 'light' ? 'border-gray-200' : theme === 'elegant' ? 'border-[#e8ddd0]' : theme === 'fashion' ? 'border-[#e9d5ff]' : 'border-white/10'} p-6`}>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-red-500/20 p-2">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${getTextColor('primary')}`}>My Favorites</h2>
                    <p className="text-sm text-slate-400">
                      {favoritedProducts.length} {favoritedProducts.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close favorites"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Favorites List */}
              <div className="flex-1 overflow-y-auto p-6">
                {favoritedProducts.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white/5 p-6">
                      <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>No favorites yet</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Start adding items to your favorites by clicking the heart icon
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        onClose();
                        navigate('/shop');
                      }}
                      className="mt-6"
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favoritedProducts.map((product) => {
                      const primaryImage = product.gallery.length > 0 
                        ? product.gallery[0] 
                        : product.imageUrl;
                      
                      return (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group cursor-pointer rounded-2xl p-4 ${getGlassPanelClass()} ${getShadowClass('md')} ${getHoverEffect()}`}
                          onClick={() => handleProductClick(product.id)}
                        >
                          <div className="flex gap-4">
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className="h-24 w-24 shrink-0 rounded-xl object-cover"
                            />
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className={`font-semibold ${getTextColor('primary')} group-hover:text-brand-300 transition`}>
                                    {product.name}
                                  </h3>
                                  {product.category && (
                                    <p className="mt-1 text-xs text-slate-400">{product.category.name}</p>
                                  )}
                                  <p className="mt-2 text-base font-bold text-brand-400">
                                    {formatCurrency(product.price)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const { removeFavorite } = useFavoritesStore.getState();
                                    removeFavorite(product.id);
                                    toast.success(`${product.name} removed from favorites`);
                                  }}
                                  className="rounded-full p-1.5 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                  aria-label="Remove from favorites"
                                >
                                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                  </svg>
                                </button>
                              </div>
                              {hasAvailableInventory(product) ? (
                                <p className="text-xs text-green-400">In stock</p>
                              ) : (
                                <p className="text-xs text-red-400">Out of stock</p>
                              )}
                              {/* Add to Cart Button */}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={!hasAvailableInventory(product)}
                                className={cn(
                                  "mt-2 w-full",
                                  !hasAvailableInventory(product) && "cursor-not-allowed opacity-50"
                                )}
                              >
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {favoritedProducts.length > 0 && (
                <div className={`border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : theme === 'elegant' ? 'border-[#e8ddd0] bg-[#f5f1e8]' : theme === 'fashion' ? 'border-[#e9d5ff] bg-[#f3e8ff]' : 'border-white/10 bg-slate-900/50'} p-6`}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => {
                      onClose();
                      navigate('/shop');
                    }}
                    className="w-full"
                  >
                    Continue Shopping
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FavoritesSidebar;

