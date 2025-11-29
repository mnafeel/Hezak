import type { Category } from '../../types';
import { useThemeColors } from '../../hooks/useThemeColors';
import { cn } from '../../lib/utils';

interface CategorySidebarProps {
  categories: Category[];
  selected?: string | null;
  onSelect: (slug?: string | null) => void;
}

const CategorySidebar = ({ categories, selected, onSelect }: CategorySidebarProps) => {
  const { getTextColor, getBorderColor, theme } = useThemeColors();
  
  // Sort categories: top selling first, then alphabetically
  const sortedCategories = [...categories].sort((a, b) => {
    if (a.isTopSelling && !b.isTopSelling) return -1;
    if (!a.isTopSelling && b.isTopSelling) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className={`text-lg font-semibold ${getTextColor('primary')}`}>Shop by Category</h2>
        <p className={`text-sm ${getTextColor('secondary')}`}>Browse our curated collections</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            `flex shrink-0 items-center gap-2 rounded-full border ${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} px-5 py-2.5 text-sm font-medium transition ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`,
            !selected
              ? 'border-brand-400/50 bg-brand-400/10 text-white'
              : getTextColor('secondary')
          )}
        >
          <span>All</span>
        </button>
        {sortedCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.slug)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition',
              category.isTopSelling
                ? selected === category.slug
                  ? 'border-brand-400 bg-brand-400/20 text-white shadow-lg shadow-brand-400/20'
                  : `border-brand-400/30 bg-brand-400/10 ${getTextColor('secondary')} hover:bg-brand-400/20 hover:border-brand-400/50`
                : selected === category.slug
                ? 'border-brand-400/50 bg-brand-400/10 text-white border-white/10'
                : `${theme === 'light' ? 'border-gray-300 bg-gray-100' : 'border-white/10 bg-white/5'} ${getTextColor('secondary')} ${theme === 'light' ? 'hover:bg-gray-200 hover:border-gray-400' : 'hover:bg-white/10 hover:border-white/20'}`
            )}
          >
            {category.isTopSelling && (
              <span className="text-xs">🔥</span>
            )}
            <span>{category.name}</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                category.isTopSelling
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-slate-300'
              )}
            >
              {category.productCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;

