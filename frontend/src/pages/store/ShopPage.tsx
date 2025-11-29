import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../../components/shared/ProductCard';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { useThemeColors } from '../../hooks/useThemeColors';
import type { Product } from '../../types';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getTextColor, getGlassPanelClass, getHoverEffect, getShadowClass, theme } = useThemeColors();
  const view = searchParams.get('view'); // 'top-selling' or 'featured'
  const categoryFromUrl = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);
  const { data: categories = [], isLoading: categoryLoading } = useCategories();
  const { data: allProductsData, isLoading: productLoading } = useProducts(
    view ? undefined : selectedCategory ?? undefined
  );
  const allProducts: Product[] = allProductsData ?? [];

  // Sync selectedCategory with URL param
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else if (!view) {
      setSelectedCategory(null);
    }
  }, [categoryFromUrl, view]);

  // Filter products based on view
  const products = useMemo<Product[]>(() => {
    if (view === 'top-selling') {
      // Get products from top selling categories
      const topSellingCategoryIds = categories
        .filter((cat) => cat.isTopSelling)
        .map((cat) => cat.id);
      return allProducts.filter(
        (product) => product.category && topSellingCategoryIds.includes(product.category.id)
      );
    }
    if (view === 'featured') {
      // Get products from featured categories
      const featuredCategoryIds = categories
        .filter((cat) => cat.isFeatured)
        .map((cat) => cat.id);
      return allProducts.filter(
        (product) => product.category && featuredCategoryIds.includes(product.category.id)
      );
    }
    return allProducts;
  }, [allProducts, view, categories]);

  const selectedCategoryName = selectedCategory
    ? categories.find((cat) => cat.slug === selectedCategory)?.name
    : null;

  const pageTitle = view === 'top-selling' 
    ? '🔥 Top Selling Products'
    : view === 'featured'
    ? '⭐ Featured Selections'
    : selectedCategoryName || 'Collections';

  const pageDescription = view === 'top-selling'
    ? 'Our most popular items, loved by customers worldwide'
    : view === 'featured'
    ? 'Spotlight pieces celebrating artistry and elegance'
    : selectedCategory
    ? `Browse products in ${selectedCategoryName}`
    : 'Explore our complete collection of premium products across all categories';

  const handleClearView = () => {
    setSearchParams({});
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${getTextColor('primary')}`}>{pageTitle}</h1>
        <p className={`text-sm sm:text-base md:text-lg ${getTextColor('secondary')}`}>{pageDescription}</p>
      </div>

      {/* Products Section */}
      <section className="space-y-6">
        {/* Results Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${getTextColor('primary')} md:text-3xl`}>{pageTitle}</h2>
            <p className={`mt-1 text-sm ${getTextColor('tertiary')}`}>
              {productLoading
                ? 'Loading...'
                : `${products.length} ${products.length === 1 ? 'product' : 'products'} ${
                    view || selectedCategory ? 'found' : 'available'
                  }`}
            </p>
          </div>
          {(view || selectedCategory) && (
            <button
              type="button"
              onClick={handleClearView}
              className={`rounded-full border ${theme === 'light' ? 'border-gray-300 bg-gray-100' : theme === 'elegant' ? 'border-[#ddd4c4] bg-[#f5f1e8]' : theme === 'fashion' ? 'border-[#d8b4fe] bg-[#f3e8ff]' : 'border-white/10 bg-white/5'} px-4 py-2 text-sm font-medium ${getTextColor('primary')} ${getShadowClass('sm')} ${getHoverEffect()}`}
            >
              {view ? 'View All Products' : 'Clear Filter'}
            </button>
          )}
        </div>

        {/* Products Grid */}
        {productLoading ? (
          <div className={`p-8 sm:p-16 text-center ${getGlassPanelClass()} ${getShadowClass('lg')}`}>
            <div className="mx-auto h-8 w-8 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
            <p className={`mt-4 text-sm sm:text-base ${getTextColor('secondary')}`}>Loading products...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-16 text-center ${getGlassPanelClass()} ${getShadowClass('lg')}`}
          >
            <div className="mx-auto max-w-sm space-y-4">
              <div className={`mx-auto h-20 w-20 rounded-full ${theme === 'light' ? 'bg-gray-200' : 'bg-white/5'} flex items-center justify-center`}>
                <span className="text-4xl">🔍</span>
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${getTextColor('primary')}`}>No products found</h3>
                <p className={`mt-2 ${getTextColor('secondary')}`}>
                  {selectedCategory
                    ? "We couldn't find any products in this category."
                    : "We don't have any products available right now."}
                </p>
              </div>
              {(view || selectedCategory) && (
                <button
                  type="button"
                  onClick={handleClearView}
                  className={`rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold ${getTextColor('primary')} transition hover:bg-brand-600`}
                >
                  View All Products
                </button>
              )}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ShopPage;

