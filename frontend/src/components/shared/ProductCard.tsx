import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import type { Product } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { useFavoritesStore } from '../../store/favorites';
import { useThemeStore } from '../../store/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const theme = useThemeStore((state) => state.theme);
  const { getTextColor, getBgColor, getGlassPanelClass, getHoverEffect } = useThemeColors();

  const favorite = isFavorite(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleFavorite(product);
    if (!favorite) {
      toast.success(`${product.name} added to favorites ❤️`);
    } else {
      toast.success(`${product.name} removed from favorites`);
    }
  };

  const primaryImage = useMemo(() => {
    if (product.gallery.length > 0) {
      return product.gallery[0]!;
    }
    return product.imageUrl;
  }, [product.imageUrl, product.gallery]);

  // Check if product has any available inventory (variant-based or general)
  const isOutOfStock = useMemo(() => {
    // If product has inventory variants, check if any variant has stock
    if (product.inventoryVariants && product.inventoryVariants.length > 0) {
      return product.inventoryVariants.every((variant) => variant.quantity === 0);
    }
    // Fallback to general inventory if no variants
    return product.inventory === 0;
  }, [product.inventory, product.inventoryVariants]);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`group flex h-full flex-col overflow-hidden cursor-pointer ${getGlassPanelClass()} ${getHoverEffect()}`}
      onClick={handleCardClick}
    >
      <div className={`relative aspect-square overflow-hidden ${theme === 'light' ? 'bg-gray-200' : theme === 'elegant' ? 'bg-[#f5f1e8]' : theme === 'fashion' ? 'bg-[#f3e8ff]' : 'bg-slate-800/50'}`}>
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
          </div>
        )}
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={cn(
            "absolute right-4 top-4 z-10 rounded-full p-2.5 backdrop-blur-sm transition-all",
            favorite
              ? "bg-red-500/90 text-white shadow-lg shadow-red-500/30 hover:bg-red-600/90"
              : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-red-400"
          )}
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <motion.svg
            className="h-5 w-5"
            fill={favorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={false}
            animate={{ scale: favorite ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </motion.svg>
        </button>
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className={`text-lg font-bold ${getTextColor('primary')} line-clamp-2 group-hover:text-brand-300 transition`}>
            {product.name}
          </h3>
          {product.itemType && (
            <p className={`mt-1 text-xs ${getTextColor('tertiary')} uppercase tracking-wide`}>{product.itemType}</p>
          )}
        </div>
        <div className="mt-auto">
          <span className={`text-2xl font-bold ${getTextColor('primary')}`}>{formatCurrency(product.price)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

