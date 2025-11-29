import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import Button from '../ui/Button';

interface HeroProps {
  onExplore: () => void;
}

const Hero = ({ onExplore }: HeroProps) => {
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const { getTextColor, getBorderColor } = useThemeColors();

  const getHeroBg = () => {
    switch (theme) {
      case 'light':
        return 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
      case 'elegant':
        return 'bg-gradient-to-br from-[#faf8f3] via-[#f5f1e8] via-[#f0ebe0] to-[#ede5d8]';
      case 'fashion':
        return 'bg-gradient-to-br from-[#faf5ff] via-[#f3e8ff] to-[#ede9fe]';
      case 'blue':
        return 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900';
      case 'purple':
        return 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900';
      case 'green':
        return 'bg-gradient-to-br from-green-900 via-green-800 to-green-900';
      case 'dark':
      default:
        return 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-[32px] ${getHeroBg()} p-8 md:p-16 shadow-2xl border ${getBorderColor()}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl space-y-8"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`inline-flex items-center gap-2 rounded-full ${theme === 'light' ? 'bg-white/90 border-gray-200 shadow-lg' : theme === 'elegant' ? 'bg-[#f5f1e8]/90 border-[#ddd4c4] shadow-xl' : theme === 'fashion' ? 'bg-[#f3e8ff]/90 border-[#d8b4fe] shadow-xl' : 'bg-white/10 border-white/20'} backdrop-blur-sm px-5 py-2 text-sm font-bold uppercase tracking-wider ${getTextColor('primary')}`}
        >
          <span>✨</span>
          <span>Premium Collection</span>
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`font-display text-4xl font-bold leading-tight ${getTextColor('primary')} md:text-5xl lg:text-6xl`}
        >
          Elevate Your Style with{' '}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Hand-Curated
          </span>{' '}
          Luxury
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-lg ${getTextColor('secondary')} md:text-xl leading-relaxed`}
        >
          Discover artisanal craftsmanship, contemporary design, and timeless elegance. Experience
          a boutique journey tailored for the connoisseur in you.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Button
            size="lg"
            variant="secondary"
            onClick={onExplore}
            className="shadow-lg shadow-brand-500/50 hover:shadow-xl hover:shadow-brand-500/50"
          >
            🛍️ Shop Now
          </Button>
          <Button
            size="lg"
            variant="ghost"
            onClick={() => navigate('/shop')}
            className={`border ${getBorderColor()} ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}
          >
            Browse All →
          </Button>
        </motion.div>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-brand-500/20 to-purple-500/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-40 right-20 h-80 w-80 rounded-full bg-gradient-to-br from-pink-500/20 to-brand-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
    </section>
  );
};

export default Hero;

