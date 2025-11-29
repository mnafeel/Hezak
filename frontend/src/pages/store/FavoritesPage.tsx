import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFavoritesStore } from '../../store/favorites';
import { useThemeColors } from '../../hooks/useThemeColors';
import ProductCard from '../../components/shared/ProductCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import type { Product } from '../../types';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const favorites = useFavoritesStore((state) => state.favorites);
  const getAvailableFavorites = useFavoritesStore((state) => state.getAvailableFavorites);
  const availableFavorites = getAvailableFavorites();
  const { getTextColor, theme } = useThemeColors();

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor('primary')}`}>My Favorites</h1>
        <p className={`mt-2 text-sm sm:text-base ${getTextColor('secondary')}`}>
          {availableFavorites.length === 0 
            ? 'No favorites yet' 
            : `${availableFavorites.length} ${availableFavorites.length === 1 ? 'item' : 'items'} saved`}
        </p>
      </div>

      {availableFavorites.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="mb-6 rounded-full bg-white/5 p-8 mx-auto w-fit">
            <svg className="h-16 w-16 text-slate-400 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold ${getTextColor('primary')} mb-2`}>No favorites yet</h3>
          <p className={`text-sm ${getTextColor('secondary')} mb-6`}>Start adding products to your favorites</p>
          <Button variant="secondary" onClick={() => navigate('/shop')}>
            Browse Products
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableFavorites.map((product: Product, index: number) => (
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
      )}
    </div>
  );
};

export default FavoritesPage;

