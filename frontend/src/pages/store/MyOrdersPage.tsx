import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useUserAuthStore } from '../../store/userAuth';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useUserOrders } from '../../hooks/useUserOrders';
import { formatCurrency, formatDate } from '../../lib/utils';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'danger'
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const user = useUserAuthStore((state) => state.user);
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(!!user);
  const { getTextColor, theme } = useThemeColors();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className={`text-2xl font-semibold ${getTextColor('primary')}`}>Please log in</h2>
          <Button variant="secondary" onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div>
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getTextColor('primary')}`}>My Orders</h1>
        <p className={`mt-2 text-sm sm:text-base ${getTextColor('secondary')}`}>View your order history</p>
      </div>

      <Card className="space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8">
        {ordersLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className={`rounded-2xl border ${theme === 'light' ? 'border-gray-300 bg-gray-50' : 'border-white/10 bg-white/5'} p-5 transition hover:border-brand-400/40`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-semibold ${getTextColor('primary')}`}>Order #{order.id}</h3>
                      <Badge variant={statusVariant[order.status] ?? 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className={`mt-1 text-xs ${getTextColor('tertiary')}`}>
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    {order.trackingId && (
                      <p className={`mt-2 text-sm ${getTextColor('secondary')}`}>
                        <span className="font-semibold">Tracking ID:</span> {order.trackingId}
                      </p>
                    )}
                    {order.courierCompany && (
                      <p className="mt-1 text-sm text-slate-300">
                        <span className="font-semibold">Courier:</span> {order.courierCompany}
                      </p>
                    )}
                    {order.trackingLink && (
                      <p className="mt-1 text-sm text-slate-300">
                        <span className="font-semibold">Tracking:</span>{' '}
                        <a
                          href={order.trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-400 hover:text-brand-300 underline"
                        >
                          Track Your Order
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-sm ${getTextColor('tertiary')}`}>Total</p>
                    <p className={`text-2xl font-semibold ${getTextColor('primary')}`}>{formatCurrency(order.total)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className={`text-xs ${getTextColor('tertiary')}`}>Items:</p>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className={`flex items-center gap-3 rounded-xl ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'} px-3 py-2`}
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${getTextColor('primary')}`}>{item.product.name}</p>
                          <div className={`mt-1 flex items-center gap-2 text-xs ${getTextColor('tertiary')}`}>
                            <span>Qty: {item.quantity}</span>
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
                            {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          </div>
                        </div>
                        <span className={`text-sm font-semibold ${getTextColor('primary')}`}>
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className={`text-sm ${getTextColor('secondary')} mb-4`}>No orders yet. Start shopping to see your orders here!</p>
            <Button variant="secondary" onClick={() => navigate('/shop')}>
              Start Shopping
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyOrdersPage;

