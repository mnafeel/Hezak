import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BannerSlideshow from '../../components/shared/BannerSlideshow';
import ProductCard from '../../components/shared/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useFeaturedCount } from '../../hooks/useFeaturedCount';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useThemeStore } from '../../store/theme';
import type { Product } from '../../types';

const HomePage = () => {
  const navigate = useNavigate();
  const { data: allProductsData, isLoading: productLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const featuredCount = useFeaturedCount().data;
  const allProducts: Product[] = allProductsData ?? [];
  const { getTextColor, getGlassPanelClass, getHoverEffect, getShadowClass } = useThemeColors();
  const theme = useThemeStore((state) => state.theme);

  const topSellingProducts = useMemo<Product[]>(() => {
    if (!Array.isArray(categories) || !Array.isArray(allProducts)) return [];
    const topSellingCategoryIds = categories
      .filter((cat) => cat.isTopSelling)
      .map((cat) => cat.id);
    
    // If no top selling categories, show all products
    if (topSellingCategoryIds.length === 0) {
      return allProducts.slice(0, 8);
    }
    
    const productsFromCategories = allProducts.filter(
      (product) => {
        // Check if product has category and it's in top selling categories
        if (product.category && topSellingCategoryIds.includes(product.category.id)) {
          return true;
        }
        // Also check categories array (for products with multiple categories)
        if (Array.isArray(product.categories) && product.categories.length > 0) {
          return product.categories.some((pc) => 
            topSellingCategoryIds.includes(pc.categoryId || pc.category?.id)
          );
        }
        return false;
      }
    );
    
    // If no products from top selling categories, show all products as fallback
    return productsFromCategories.length > 0 
      ? productsFromCategories.slice(0, 8)
      : allProducts.slice(0, 8);
  }, [allProducts, categories]);

  const featuredProducts = useMemo<Product[]>(() => {
    if (!Array.isArray(categories) || !Array.isArray(allProducts)) return [];
    // Get products from featured categories
    const featuredCategoryIds = categories
      .filter((cat) => cat.isFeatured)
      .map((cat) => cat.id);
    
    // If no featured categories, show all products
    if (featuredCategoryIds.length === 0) {
      return allProducts.slice(0, featuredCount ?? 8);
    }
    
    const productsFromCategories = allProducts.filter(
      (product) => {
        // Check if product has category and it's in featured categories
        if (product.category && featuredCategoryIds.includes(product.category.id)) {
          return true;
        }
        // Also check categories array (for products with multiple categories)
        if (Array.isArray(product.categories) && product.categories.length > 0) {
          return product.categories.some((pc) => 
            featuredCategoryIds.includes(pc.categoryId || pc.category?.id)
          );
        }
        return false;
      }
    );
    
    // If no products from featured categories, show all products as fallback
    return productsFromCategories.length > 0 
      ? productsFromCategories.slice(0, featuredCount ?? 8)
      : allProducts.slice(0, featuredCount ?? 8);
  }, [allProducts, categories, featuredCount]);

  const handleExplore = () => {
    navigate('/shop');
  };

  return (
    <div className="space-y-8 sm:space-y-12 md:space-y-16">
      {/* Banner Slideshow */}
      <BannerSlideshow />

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExplore}
          className={`group relative overflow-hidden p-6 text-left ${getGlassPanelClass()} ${getHoverEffect()}`}
        >
          <div className="relative z-10">
            <h3 className={`text-xl font-semibold ${getTextColor('primary')}`}>Browse All Products</h3>
            <p className={`mt-2 text-sm ${getTextColor('secondary')}`}>Explore our complete collection</p>
            <span className="mt-4 inline-block text-brand-400 group-hover:text-brand-300">
              Shop Now →
            </span>
          </div>
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-500/20 blur-2xl" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/shop?view=top-selling')}
          className={`group relative overflow-hidden p-6 text-left ${getGlassPanelClass()} ${getHoverEffect()}`}
        >
          <div className="relative z-10">
            <h3 className={`text-xl font-semibold ${getTextColor('primary')}`}>Top Picks</h3>
            <p className={`mt-2 text-sm ${getTextColor('secondary')}`}>See what's trending</p>
            <span className="mt-4 inline-block text-brand-400 group-hover:text-brand-300">
              View All →
            </span>
          </div>
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/shop?view=featured')}
          className={`group relative overflow-hidden p-6 text-left transition ${getGlassPanelClass()} ${theme === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/10'} sm:col-span-2 lg:col-span-1`}
        >
          <div className="relative z-10">
            <h3 className={`text-xl font-semibold ${getTextColor('primary')}`}>Featured Collection</h3>
            <p className={`mt-2 text-sm ${getTextColor('secondary')}`}>Handpicked premium selections</p>
            <span className="mt-4 inline-block text-brand-400 group-hover:text-brand-300">
              Discover →
            </span>
          </div>
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-pink-500/20 blur-2xl" />
        </motion.button>
      </div>

      {/* Top Selling Section */}
      {topSellingProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor('primary')}`}>🔥 Top Selling</h2>
              <p className={`mt-2 text-sm sm:text-base ${getTextColor('secondary')}`}>
                Our most popular items, loved by customers worldwide
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop?view=top-selling')}
              className={`rounded-full border border-brand-400/50 bg-brand-400/10 px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold ${getTextColor('primary')} transition hover:bg-brand-400/20 hover:border-brand-400`}
            >
              View All Top Selling →
            </button>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {topSellingProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor('primary')}`}>⭐ Featured Selections</h2>
              <p className={`mt-2 text-base ${getTextColor('secondary')}`}>
                Spotlight pieces celebrating artistry and elegance
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop?view=featured')}
              className={`rounded-full border border-brand-400/50 bg-brand-400/10 px-6 py-3 text-sm font-semibold ${getTextColor('primary')} transition hover:bg-brand-400/20 hover:border-brand-400`}
            >
              View All Featured →
            </button>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Loading State */}
      {productLoading && (
        <div className={`p-16 text-center ${getGlassPanelClass()}`}>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
          <p className={`mt-4 ${getTextColor('secondary')}`}>Loading amazing products...</p>
        </div>
      )}

      {/* Empty State */}
      {!productLoading && topSellingProducts.length === 0 && featuredProducts.length === 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-16 text-center ${getGlassPanelClass()}`}
        >
          <div className="mx-auto max-w-md space-y-6">
            <div className="mx-auto h-24 w-24 rounded-full bg-brand-500/10 flex items-center justify-center">
              <span className="text-4xl">🛍️</span>
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${getTextColor('primary')}`}>Welcome to Hezak Boutique</h2>
              <p className={`mt-2 ${getTextColor('secondary')}`}>
                Your premium shopping destination. Start adding products to see them here.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExplore}
              className={`rounded-full bg-brand-500 px-8 py-4 text-base font-semibold ${getTextColor('primary')} transition hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/50`}
            >
              Start Shopping
            </button>
          </div>
        </motion.section>
      )}
    </div>
  );
};

export default HomePage;

