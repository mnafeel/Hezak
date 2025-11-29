import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cart';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatCurrency, cn } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const CartPage = () => {
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
    navigate('/checkout');
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor('primary')}`}>Shopping Cart</h1>
        <p className={`mt-2 text-sm sm:text-base ${getTextColor('secondary')}`}>
          {items.length === 0 ? 'Your cart is empty' : `${items.length} ${items.length === 1 ? 'item' : 'items'} in your cart`}
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="mb-6 rounded-full bg-white/5 p-8 mx-auto w-fit">
            <svg className="h-16 w-16 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className={`text-xl font-semibold ${getTextColor('primary')} mb-2`}>Your cart is empty</h3>
          <p className={`text-sm ${getTextColor('secondary')} mb-6`}>Start adding items to your cart</p>
          <Button variant="secondary" onClick={() => navigate('/shop')}>
            Continue Shopping
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const primaryImage = item.product.gallery.length > 0 
                ? item.product.gallery[0] 
                : item.product.imageUrl;
              
              return (
                <Card key={item.key} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <img
                      src={primaryImage}
                      alt={item.product.name}
                      className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-semibold ${getTextColor('primary')} mb-2`}>{item.product.name}</h3>
                      <div className={`flex flex-wrap items-center gap-2 text-sm ${getTextColor('secondary')} mb-3`}>
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1">
                            {item.selectedColor.hex && (
                              <span
                                className="h-4 w-4 rounded-full border border-white/30"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                            )}
                            <span>{item.selectedColor.name}</span>
                          </span>
                        )}
                        {item.selectedSize && (
                          <>
                            {item.selectedColor && <span>•</span>}
                            <span>Size: {item.selectedSize.name}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold transition',
                              item.quantity <= 1
                                ? 'cursor-not-allowed opacity-50'
                                : theme === 'light' || theme === 'elegant' || theme === 'fashion'
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            )}
                          >
                            −
                          </button>
                          <span className={`min-w-[3rem] text-center text-lg font-semibold ${getTextColor('primary')}`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold transition',
                              theme === 'light' || theme === 'elegant' || theme === 'fashion'
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            )}
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${getTextColor('primary')}`}>
                            {formatCurrency(item.product.price * item.quantity)}
                          </p>
                          <p className={`text-sm ${getTextColor('tertiary')}`}>
                            {formatCurrency(item.product.price)} each
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        className={`mt-3 text-sm text-red-400 hover:text-red-300 transition`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h2 className={`text-xl font-semibold ${getTextColor('primary')} mb-4`}>Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className={getTextColor('secondary')}>Subtotal</span>
                  <span className={getTextColor('primary')}>{formatCurrency(total)}</span>
                </div>
                <div className={`border-t ${theme === 'light' ? 'border-gray-200' : theme === 'elegant' ? 'border-[#e8ddd0]' : theme === 'fashion' ? 'border-[#e9d5ff]' : 'border-white/10'} pt-3 flex justify-between`}>
                  <span className={`text-lg font-semibold ${getTextColor('primary')}`}>Total</span>
                  <span className={`text-lg font-semibold ${getTextColor('primary')}`}>{formatCurrency(total)}</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={handleProceedToCheckout}
                className="w-full"
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/shop')}
                className="w-full mt-3"
              >
                Continue Shopping
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

