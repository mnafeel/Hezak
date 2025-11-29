import Card from '../ui/Card';
import { useCartStore } from '../../store/cart';
import { useThemeColors } from '../../hooks/useThemeColors';
import { formatCurrency } from '../../lib/utils';

const OrderSummary = () => {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const { getTextColor, getBorderColor, theme } = useThemeColors();

  if (!items.length) {
    return (
      <Card className={`p-6 text-center ${getTextColor('secondary')}`}>
        Your cart is waiting to be filled with inspiration.
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>Order Summary</h3>
        <p className={`text-sm ${getTextColor('secondary')}`}>
          Review your selection before completing the order.
        </p>
      </div>
      <div className={`space-y-4 divide-y ${theme === 'light' ? 'divide-gray-200' : 'divide-white/10'}`}>
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between pt-4 first:pt-0">
            <div>
              <p className={`text-base font-medium ${getTextColor('primary')}`}>{item.product.name}</p>
              {(item.selectedColor || item.selectedSize) && (
                <div className={`mt-1 flex flex-wrap items-center gap-3 text-xs ${getTextColor('tertiary')}`}>
                  {item.selectedColor && (
                    <span className="inline-flex items-center gap-1">
                      {item.selectedColor.hex && (
                        <span
                          className={`h-3 w-3 rounded-full border ${theme === 'light' ? 'border-gray-300' : 'border-white/30'}`}
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                      )}
                      <span>{item.selectedColor.name}</span>
                    </span>
                  )}
                  {item.selectedSize && <span>Size {item.selectedSize.name}</span>}
                </div>
              )}
              <p className={`text-sm ${getTextColor('tertiary')}`}>
                {item.quantity} × {formatCurrency(item.product.price)}
              </p>
            </div>
            <span className={`text-base font-semibold ${getTextColor('primary')}`}>
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-between border-t ${getBorderColor()} pt-4`}>
        <span className={`text-lg ${getTextColor('secondary')}`}>Total investment</span>
        <span className={`text-2xl font-semibold ${getTextColor('primary')}`}>{formatCurrency(total)}</span>
      </div>
    </Card>
  );
};

export default OrderSummary;

