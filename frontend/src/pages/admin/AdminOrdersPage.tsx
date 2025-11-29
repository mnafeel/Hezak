import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { updateOrder, createOrder } from '../../lib/api';
import { useProducts } from '../../hooks/useProducts';
import { showError } from '../../lib/errorHandler';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import type { Order, Product, CreateOrderPayload } from '../../types';

type OrderSortOption = 'status-pending' | 'status-processing' | 'status-shipped' | 'status-delivered' | 'status-cancelled' | 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'danger'
};

interface OrderItem {
  productId: number;
  quantity: number;
  selectedColor?: { name: string; hex?: string };
  selectedSize?: { name: string };
}

const AdminOrdersPage = () => {
  const { data: orders = [] } = useAdminOrders();
  const { data: products = [] } = useProducts();
  const queryClient = useQueryClient();
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order['status']>('PENDING');
  const [trackingId, setTrackingId] = useState<string>('');
  const [courierCompany, setCourierCompany] = useState<string>('');
  const [trackingLink, setTrackingLink] = useState<string>('');
  const [sortBy, setSortBy] = useState<OrderSortOption>('date-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'online' | 'offline'>('all');
  
  // Order creation state
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex?: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ name: string } | null>(null);
  const [orderSource, setOrderSource] = useState<'INSTAGRAM' | 'PHONE' | 'IN_PERSON' | 'OTHER'>('INSTAGRAM');
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setStatus(order.status);
    setTrackingId(order.trackingId || '');
    setCourierCompany(order.courierCompany || '');
    setTrackingLink(order.trackingLink || '');
  };

  const handleCancel = () => {
    setEditingOrder(null);
    setStatus('PENDING');
    setTrackingId('');
    setCourierCompany('');
    setTrackingLink('');
  };

  const handleSave = async () => {
    if (!editingOrder) return;

    try {
      await updateOrder(editingOrder.id, {
        status,
        trackingId: trackingId.trim() || null,
        courierCompany: courierCompany.trim() || null,
        trackingLink: trackingLink.trim() || null
      });
      toast.success('Order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'orders'] });
      handleCancel();
    } catch (error) {
      showError(error, 'Failed to update order. Please try again.');
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId || selectedQuantity < 1) {
      toast.error('Please select a product and quantity');
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Check if color/size are required
    if (product.colors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    setOrderItems([
      ...orderItems,
      {
        productId: selectedProductId,
        quantity: selectedQuantity,
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined
      }
    ]);

    // Reset selection
    setSelectedProductId('');
    setSelectedQuantity(1);
    setSelectedColor(null);
    setSelectedSize(null);
    toast.success('Item added to order');
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreateOrder = async () => {
    if (!customerName || !customerEmail || !addressLine1 || !city || !postalCode || !country) {
      toast.error('Please fill in all required customer details');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    setIsCreating(true);
    try {
      const payload: CreateOrderPayload = {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone || undefined,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          state: state || undefined,
          postalCode,
          country
        },
        items: orderItems,
        orderSource
      };

      await createOrder(payload);
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      
      // Reset form
      setIsCreatingOrder(false);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPostalCode('');
      setCountry('');
      setOrderItems([]);
      setSelectedProductId('');
      setSelectedQuantity(1);
      setSelectedColor(null);
      setSelectedSize(null);
      setOrderSource('INSTAGRAM');
    } catch (error) {
      showError(error, 'Failed to create order. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;
  const totalAmount = orderItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const filteredAndSortedOrders = useMemo(() => {
    // First filter by order source (online/offline)
    let filtered = orders;
    if (orderFilter === 'online') {
      filtered = orders.filter((order) => !order.orderSource || order.orderSource === 'WEBSITE');
    } else if (orderFilter === 'offline') {
      filtered = orders.filter((order) => order.orderSource && order.orderSource !== 'WEBSITE');
    }
    
    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => 
        order.id.toString().includes(query) ||
        order.user.name.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query) ||
        (order.user.phone && order.user.phone.toLowerCase().includes(query)) ||
        (order.trackingId && order.trackingId.toLowerCase().includes(query)) ||
        (order.courierCompany && order.courierCompany.toLowerCase().includes(query)) ||
        order.status.toLowerCase().includes(query) ||
        order.items.some((item) => item.product.name.toLowerCase().includes(query))
      );
    }
    
    // Then sort by status priority, then by date
    const sorted = [...filtered];
    const statusPriority: Record<string, number> = {
      'PENDING': 1,
      'PROCESSING': 2,
      'SHIPPED': 3,
      'DELIVERED': 4,
      'CANCELLED': 5
    };
    
    switch (sortBy) {
      case 'status-pending':
        return sorted.sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          if (a.status === 'PENDING' && b.status === 'PENDING') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return statusPriority[a.status] - statusPriority[b.status];
        });
      case 'status-processing':
        return sorted.sort((a, b) => {
          if (a.status === 'PROCESSING' && b.status !== 'PROCESSING') return -1;
          if (a.status !== 'PROCESSING' && b.status === 'PROCESSING') return 1;
          if (a.status === 'PROCESSING' && b.status === 'PROCESSING') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return statusPriority[a.status] - statusPriority[b.status];
        });
      case 'status-shipped':
        return sorted.sort((a, b) => {
          if (a.status === 'SHIPPED' && b.status !== 'SHIPPED') return -1;
          if (a.status !== 'SHIPPED' && b.status === 'SHIPPED') return 1;
          if (a.status === 'SHIPPED' && b.status === 'SHIPPED') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return statusPriority[a.status] - statusPriority[b.status];
        });
      case 'status-delivered':
        return sorted.sort((a, b) => {
          if (a.status === 'DELIVERED' && b.status !== 'DELIVERED') return -1;
          if (a.status !== 'DELIVERED' && b.status === 'DELIVERED') return 1;
          if (a.status === 'DELIVERED' && b.status === 'DELIVERED') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return statusPriority[a.status] - statusPriority[b.status];
        });
      case 'status-cancelled':
        return sorted.sort((a, b) => {
          if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return -1;
          if (a.status !== 'CANCELLED' && b.status === 'CANCELLED') return 1;
          if (a.status === 'CANCELLED' && b.status === 'CANCELLED') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return statusPriority[a.status] - statusPriority[b.status];
        });
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'total-desc':
        return sorted.sort((a, b) => b.total - a.total);
      case 'total-asc':
        return sorted.sort((a, b) => a.total - b.total);
      default:
        return sorted;
    }
  }, [orders, sortBy, searchQuery, orderFilter]);

  return (
    <Card title="Orders" className="space-y-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-400">
              {filteredAndSortedOrders.length} of {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  orderFilter === 'all'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('online')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  orderFilter === 'online'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                )}
              >
                Online ({orders.filter(o => !o.orderSource || o.orderSource === 'WEBSITE').length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('offline')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition',
                  orderFilter === 'offline'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                )}
              >
                Offline ({orders.filter(o => o.orderSource && o.orderSource !== 'WEBSITE').length})
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-white">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as OrderSortOption)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
            >
              <option value="status-pending">Pending Orders</option>
              <option value="status-processing">Processing Orders</option>
              <option value="status-shipped">Shipped Orders</option>
              <option value="status-delivered">Delivered Orders</option>
              <option value="status-cancelled">Cancelled Orders</option>
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="total-desc">Highest Total</option>
              <option value="total-asc">Lowest Total</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            label="Search Orders"
            placeholder="Search by order ID, customer name, email, phone, tracking ID, status, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={() => setIsCreatingOrder(!isCreatingOrder)}
            >
              {isCreatingOrder ? 'Cancel' : '+ Create Offline Order'}
            </Button>
          </div>
        </div>
      </div>

      {/* Create Order Form */}
      {isCreatingOrder && (
        <div className="mb-6 rounded-2xl border border-brand-400/30 bg-brand-500/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">Create Offline Order</h3>
            <Badge variant="default" className="bg-slate-700/50 text-slate-200">
              Manual Entry
            </Badge>
          </div>
          <p className="mb-4 text-sm text-slate-200">
            Use this form to manually enter orders placed offline (phone, in-person, etc.)
          </p>
          
          <div className="space-y-6">
            {/* Order Source */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-white">Order Source</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">Order Source *</label>
                  <select
                    value={orderSource}
                    onChange={(e) => setOrderSource(e.target.value as typeof orderSource)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                  >
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="PHONE">Phone</option>
                    <option value="IN_PERSON">In Person</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-white">Customer Information</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Full Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <Input
                  label="Email *"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
                <Input
                  label="Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <Input
                  label="Address Line 1 *"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  required
                />
                <Input
                  label="Address Line 2"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                />
                <Input
                  label="City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="State / Region"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <Input
                  label="Postal Code *"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
                <Input
                  label="Country *"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Add Items */}
            <div>
              <h4 className="mb-3 text-lg font-semibold text-white">Order Items</h4>
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Product *</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(Number(e.target.value) || '');
                        setSelectedColor(null);
                        setSelectedSize(null);
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedProduct && selectedProduct.colors.length > 0 && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Color *</label>
                      <select
                        value={selectedColor?.name || ''}
                        onChange={(e) => {
                          const color = selectedProduct.colors.find((c) => c.name === e.target.value);
                          setSelectedColor(color || null);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      >
                        <option value="">Select Color</option>
                        {selectedProduct.colors.map((color) => (
                          <option key={color.name} value={color.name}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedProduct && selectedProduct.sizes.length > 0 && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-white">Size *</label>
                      <select
                        value={selectedSize?.name || ''}
                        onChange={(e) => {
                          const size = selectedProduct.sizes.find((s) => s.name === e.target.value);
                          setSelectedSize(size || null);
                        }}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                      >
                        <option value="">Select Size</option>
                        {selectedProduct.sizes.map((size) => (
                          <option key={size.name} value={size.name}>
                            {size.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-white">Quantity *</label>
                    <Input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(Number(e.target.value) || 1)}
                    />
                  </div>
                </div>
                <Button variant="secondary" onClick={handleAddItem} className="w-full">
                  Add Item
                </Button>
              </div>

              {/* Order Items List */}
              {orderItems.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-semibold text-white">Added Items:</h5>
                  {orderItems.map((item, index) => {
                    const product = products.find((p) => p.id === item.productId);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
                      >
                        <div>
                          <span className="font-medium text-white">{product?.name}</span>
                          <span className="ml-2 text-sm text-slate-400">×{item.quantity}</span>
                          {item.selectedColor && (
                            <span className="ml-2 text-xs text-slate-400">
                              Color: {item.selectedColor.name}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="ml-2 text-xs text-slate-400">
                              Size: {item.selectedSize.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-white">
                            {product ? formatCurrency(product.price * item.quantity) : ''}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-300">Total Amount</p>
                      <p className="text-2xl font-semibold text-white">{formatCurrency(totalAmount)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCreateOrder}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? 'Creating Order...' : 'Create Order'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreatingOrder(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredAndSortedOrders.length ? (
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => {
            const isOnline = !order.orderSource || order.orderSource === 'WEBSITE';
            
            return (
              <div
                key={order.id}
                className={`rounded-3xl border p-5 shadow-inner shadow-black/10 ${
                  isOnline
                    ? 'border-blue-500/30 bg-blue-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                }`}
              >
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-white">Order #{order.id}</h3>
                                <Badge variant={statusVariant[order.status] ?? 'default'}>
                                  {order.status}
                                </Badge>
                                {isOnline ? (
                                  <Badge variant="default" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                                    Online
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="bg-red-500/20 text-red-300 border-red-500/50">
                                    {order.orderSource === 'INSTAGRAM' ? 'Instagram' :
                                     order.orderSource === 'PHONE' ? 'Phone' :
                                     order.orderSource === 'IN_PERSON' ? 'In Person' :
                                     'Offline'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-300">
                                {order.user.name} • {order.user.email}
                              </p>
                              <p className="text-xs text-slate-300">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                              {order.trackingId && (
                                <p className="mt-1 text-xs text-slate-300">
                                  <span className="font-semibold">Tracking ID:</span> {order.trackingId}
                                </p>
                              )}
                              {order.courierCompany && (
                                <p className="mt-1 text-xs text-slate-300">
                                  <span className="font-semibold">Courier:</span> {order.courierCompany}
                                </p>
                              )}
                              {order.trackingLink && (
                                <p className="mt-1 text-xs text-slate-300">
                                  <span className="font-semibold">Tracking:</span>{' '}
                                  <a
                                    href={order.trackingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-brand-400 hover:text-brand-300 underline"
                                  >
                                    View Tracking
                                  </a>
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="text-right">
                                <p className="text-sm text-slate-300">Total</p>
                                <p className="text-2xl font-semibold text-white">{formatCurrency(order.total)}</p>
                              </div>
                              <Button variant="secondary" size="sm" onClick={() => handleEdit(order)}>
                                Update Status
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl bg-white/5 p-4">
                              <p className="text-xs text-slate-400">Delivery</p>
                              <p className="mt-1 text-sm text-white">
                                {order.user.addressLine1}
                                {order.user.addressLine2 ? `, ${order.user.addressLine2}` : ''}
                              </p>
                              <p className="text-sm text-slate-300">
                                {order.user.city}, {order.user.state ?? '—'} {order.user.postalCode}
                              </p>
                              <p className="text-sm text-slate-300">{order.user.country}</p>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-4">
                              <p className="text-xs text-slate-400">Items</p>
                              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                                {order.items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="flex flex-col gap-1 rounded-xl bg-white/5 px-3 py-2 md:flex-row md:items-center md:justify-between"
                                  >
                                    <div>
                                      <span className="font-medium text-white">{item.product.name}</span>{' '}
                                      <span className="text-xs text-slate-400">×{item.quantity}</span>
                                      {(item.selectedColor || item.selectedSize) && (
                                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
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
                                          {item.selectedSize && <span>Size {item.selectedSize}</span>}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-sm text-white">
                                      {formatCurrency(item.unitPrice * item.quantity)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Edit Order Modal */}
                          {editingOrder?.id === order.id && (
                            <div className="mt-4 rounded-2xl border border-brand-400/30 bg-brand-500/10 p-5">
                              <h4 className="mb-4 text-lg font-semibold text-white">Update Order Status</h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                                    Status
                                  </label>
                                  <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Order['status'])}
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="SHIPPED">SHIPPED</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-white">
                                    Tracking ID
                                  </label>
                                  <Input
                                    type="text"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    placeholder="Enter tracking ID (optional)"
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-white">
                                    Courier Company
                                  </label>
                                  <Input
                                    type="text"
                                    value={courierCompany}
                                    onChange={(e) => setCourierCompany(e.target.value)}
                                    placeholder="Enter courier company name (optional)"
                                    className="w-full"
                                  />
                                </div>
                                <div>
                                  <label className="mb-2 block text-sm font-semibold text-white">
                                    Tracking Link
                                  </label>
                                  <Input
                                    type="url"
                                    value={trackingLink}
                                    onChange={(e) => setTrackingLink(e.target.value)}
                                    placeholder="https://tracking.example.com/123456 (optional)"
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex gap-3">
                                  <Button variant="secondary" onClick={handleSave} className="flex-1">
                                    Save Changes
                                  </Button>
                                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
              </div>
            );
          })}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-300 mb-2">No orders found matching "{searchQuery}"</p>
          <Button variant="ghost" onClick={() => setSearchQuery('')} size="sm">
            Clear Search
          </Button>
        </div>
      ) : (
        <p className="text-sm text-slate-300">No orders yet. Orders will appear here.</p>
      )}
    </Card>
  );
};

export default AdminOrdersPage;

