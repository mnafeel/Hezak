import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeColors } from '../../hooks/useThemeColors';
import { cn } from '../../lib/utils';
import type { Category } from '../../types';

interface CategorySidebarMobileProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory?: string | null;
}

const CategorySidebarMobile = ({ isOpen, onClose, categories, selectedCategory }: CategorySidebarMobileProps) => {
  const navigate = useNavigate();
  const { getGlassPanelClass, getTextColor, getBorderColor, theme } = useThemeColors();

  // Sort categories: top selling first, then alphabetically
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.isTopSelling && !b.isTopSelling) return -1;
    if (!a.isTopSelling && b.isTopSelling) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleCategorySelect = (categorySlug?: string | null) => {
    if (categorySlug) {
      navigate(`/shop?category=${categorySlug}`);
    } else {
      navigate('/shop');
    }
    onClose();
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
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed left-0 top-0 z-50 h-full w-full max-w-xs shadow-2xl ${
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
                <h2 className={`text-2xl font-bold ${getTextColor('primary')}`}>Categories</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close categories"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Categories List */}
              <div className="flex-1 overflow-y-auto p-4">
                {categories.length > 0 ? (
                  <div className="space-y-2">
                    {/* All Products Button */}
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(null)}
                      className={cn(
                        'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition flex items-center justify-between',
                        !selectedCategory
                          ? `border-brand-400/50 bg-brand-400/10 ${getTextColor('primary')}`
                          : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
                      )}
                    >
                      <span className="font-semibold">All Products</span>
                    </button>

                    {/* Category Buttons */}
                    {sortedCategories.map((category) => {
                      const isSelected = selectedCategory === category.slug;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategorySelect(category.slug)}
                          className={cn(
                            'w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition flex items-center justify-between',
                            isSelected
                              ? category.isTopSelling
                                ? `border-brand-400 bg-brand-400/20 ${getTextColor('primary')} shadow-lg shadow-brand-400/20`
                                : `border-brand-400/50 bg-brand-400/10 ${getTextColor('primary')}`
                              : category.isTopSelling
                              ? `${theme === 'light' ? 'border-brand-400/30 bg-brand-400/10' : 'border-brand-400/30 bg-brand-400/10'} ${getTextColor('secondary')} hover:bg-brand-400/20 hover:border-brand-400/50`
                              : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {category.isTopSelling && <span className="text-base">🔥</span>}
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-1 text-xs font-semibold',
                              category.isTopSelling 
                                ? theme === 'light' ? 'bg-gray-300 text-gray-900' : 'bg-white/20 text-white'
                                : theme === 'light' ? 'bg-gray-200 text-gray-700' : 'bg-white/10 text-slate-300'
                            )}
                          >
                            {category.productCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`flex h-full items-center justify-center text-center ${getTextColor('tertiary')}`}>
                    <div>
                      <p className="text-sm">Loading categories...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CategorySidebarMobile;

