import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cart';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatCurrency, cn } from '../../lib/utils';
import Button from '../ui/Button';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar = ({ isOpen, onClose }: CartSidebarProps) => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const { getGlassPanelClass, getTextColor, getShadowClass, getHoverEffect, theme } = useThemeColors();
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const total = useCartStore((state) => state.total());

  const handleProceedToCheckout = () => {
    if (items.length === 0) {
      return;
    }
    onClose();
    navigate('/checkout');
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
                <h2 className={`text-2xl font-bold ${getTextColor('primary')}`}>Shopping Cart</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close cart"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-full bg-white/5 p-6">
                      <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>Your cart is empty</h3>
                    <p className="mt-2 text-sm text-slate-400">Start adding items to your cart</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const primaryImage = item.product.gallery.length > 0 
                        ? item.product.gallery[0] 
                        : item.product.imageUrl;
                      
                      return (
                        <div
                          key={item.key}
                          className={`flex gap-4 rounded-2xl p-4 ${getGlassPanelClass()} ${getShadowClass('md')}`}
                        >
                          <img
                            src={primaryImage}
                            alt={item.product.name}
                            className="h-24 w-24 shrink-0 rounded-xl object-cover"
                          />
                          <div className="flex flex-1 flex-col gap-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className={`font-semibold ${getTextColor('primary')}`}>{item.product.name}</h3>
                                {(item.selectedColor || item.selectedSize) && (
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                                    {item.selectedColor && (
                                      <span className="inline-flex items-center gap-1">
                                        {item.selectedColor.hex && (
                                          <span
                                            className="h-3 w-3 rounded-full border border-white/30"
                                            style={{ backgroundColor: item.selectedColor.hex }}
                                          />
                                        )}
                                        <span>{item.selectedColor.name}</span>
                                      </span>
                                    )}
                                    {item.selectedSize && <span>Size {item.selectedSize.name}</span>}
                                  </div>
                                )}
                                <p className="mt-1 text-sm font-semibold text-brand-300">
                                  {formatCurrency(item.product.price)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item.key)}
                                className="rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-red-400"
                                aria-label="Remove item"
                              >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className={`flex items-center gap-2 rounded-lg ${getGlassPanelClass()} ${getShadowClass('sm')}`}>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className={cn(
                                    "px-2 py-1 text-sm font-medium transition",
                                    item.quantity <= 1
                                      ? "cursor-not-allowed text-slate-600"
                                      : "text-slate-300 hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  −
                                </button>
                                <span className={`min-w-[2rem] text-center text-sm font-semibold ${getTextColor('primary')}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.inventory}
                                  className={cn(
                                    "px-2 py-1 text-sm font-medium transition",
                                    item.quantity >= item.product.inventory
                                      ? "cursor-not-allowed text-slate-600"
                                      : "text-slate-300 hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  +
                                </button>
                              </div>
                              <span className={`text-base font-bold ${getTextColor('primary')}`}>
                                {formatCurrency(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer with Total and Checkout Button */}
              {items.length > 0 && (
                <div className={`border-t ${theme === 'light' ? 'border-gray-200 bg-gray-50' : theme === 'elegant' ? 'border-[#e8ddd0] bg-[#f5f1e8]' : theme === 'fashion' ? 'border-[#e9d5ff] bg-[#f3e8ff]' : 'border-white/10 bg-slate-900/50'} p-6`}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`text-lg font-semibold ${getTextColor('secondary')}`}>Total</span>
                    <span className={`text-2xl font-bold ${getTextColor('primary')}`}>{formatCurrency(total)}</span>
                  </div>
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleProceedToCheckout}
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full text-center text-sm text-slate-400 transition hover:text-white"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;

