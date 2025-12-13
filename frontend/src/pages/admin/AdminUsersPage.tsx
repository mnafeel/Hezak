import { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { formatCurrency, formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { AdminUser } from '../../types';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  SHIPPED: 'default',
  DELIVERED: 'success',
  CANCELLED: 'danger'
};

type SortOption = 'name-asc' | 'name-desc' | 'email-asc' | 'email-desc' | 'date-asc' | 'date-desc' | 'orders-asc' | 'orders-desc' | 'order-type-online' | 'order-type-offline';

const AdminUsersPage = () => {
  const { data: users = [], isLoading } = useAdminUsers();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedUser = users.find((u) => u.id === selectedUserId);

  const filteredAndSortedUsers = useMemo(() => {
    // First filter out invalid users (missing name or email)
    const validUsers = users.filter((user) => 
      user && 
      user.id && 
      user.name && 
      typeof user.name === 'string' && 
      user.name.trim() !== '' &&
      user.email && 
      typeof user.email === 'string' && 
      user.email.trim() !== ''
    );
    
    // Then filter by search query
    let filtered = validUsers;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = validUsers.filter((user) => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.phone && user.phone.toLowerCase().includes(query)) ||
        (user.city && user.city.toLowerCase().includes(query)) ||
        (user.country && user.country.toLowerCase().includes(query))
      );
    }
    
    // Then sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'email-asc':
        return sorted.sort((a, b) => a.email.localeCompare(b.email));
      case 'email-desc':
        return sorted.sort((a, b) => b.email.localeCompare(a.email));
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'orders-asc':
        return sorted.sort((a, b) => a.orders.length - b.orders.length);
      case 'orders-desc':
        return sorted.sort((a, b) => b.orders.length - a.orders.length);
      case 'order-type-online':
        return sorted.sort((a, b) => {
          const aOnline = a.orders.filter(o => !o.orderSource || o.orderSource === 'WEBSITE').length;
          const bOnline = b.orders.filter(o => !o.orderSource || o.orderSource === 'WEBSITE').length;
          if (bOnline !== aOnline) return bOnline - aOnline;
          return b.orders.length - a.orders.length;
        }).filter(user => user.orders.some(o => !o.orderSource || o.orderSource === 'WEBSITE'));
      case 'order-type-offline':
        return sorted.sort((a, b) => {
          const aOffline = a.orders.filter(o => o.orderSource && o.orderSource !== 'WEBSITE').length;
          const bOffline = b.orders.filter(o => o.orderSource && o.orderSource !== 'WEBSITE').length;
          if (bOffline !== aOffline) return bOffline - aOffline;
          return b.orders.length - a.orders.length;
        }).filter(user => user.orders.some(o => o.orderSource && o.orderSource !== 'WEBSITE'));
      default:
        return sorted;
    }
  }, [users, sortBy, searchQuery]);
  
  // Count invalid users (for display)
  const invalidUsersCount = users.filter((user) => 
    !user || 
    !user.id || 
    !user.name || 
    typeof user.name !== 'string' || 
    user.name.trim() === '' ||
    !user.email || 
    typeof user.email !== 'string' || 
    user.email.trim() === ''
  ).length;

  if (isLoading) {
    return (
      <Card title="Users" className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-400/30 border-t-brand-400" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card title="Users" className="space-y-4">
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-slate-200">
              {filteredAndSortedUsers.length} of {users.length} {users.length === 1 ? 'user' : 'users'}
              {searchQuery && ` matching "${searchQuery}"`}
              {invalidUsersCount > 0 && (
                <span className="ml-2 text-amber-400">
                  ({invalidUsersCount} invalid {invalidUsersCount === 1 ? 'user' : 'users'} filtered out)
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-sm text-white">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/60 [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              <option value="orders-desc">Most Orders</option>
              <option value="orders-asc">Fewest Orders</option>
              <option value="order-type-online">Users with Online Orders</option>
              <option value="order-type-offline">Users with Offline Orders</option>
            </select>
            </div>
          </div>
          <Input
            label="Search Users"
            placeholder="Search by name, email, phone, city, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-4">
          {filteredAndSortedUsers.length ? (
            filteredAndSortedUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-brand-400/40"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/20 text-xl font-semibold text-brand-300">
                      {(user.name && user.name.trim() ? user.name.charAt(0) : '?').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {user.name && user.name.trim() ? user.name : 'Unknown User'}
                      </h3>
                      <p className="text-sm text-slate-200">
                        {user.email && user.email.trim() ? user.email : 'No email'}
                      </p>
                      {user.phone && <p className="text-xs text-slate-300">{user.phone}</p>}
                      <p className="mt-1 text-xs text-slate-300">
                        Joined: {formatDate(user.createdAt)} • {user.orders.length}{' '}
                        {user.orders.length === 1 ? 'order' : 'orders'}
                        {user.orders.length > 0 && (
                          <>
                            {' • '}
                            <span className="text-brand-300">
                              {user.orders.filter(o => !o.orderSource || o.orderSource === 'WEBSITE').length} online
                            </span>
                            {user.orders.filter(o => o.orderSource && o.orderSource !== 'WEBSITE').length > 0 && (
                              <>
                                {' • '}
                                <span className="text-amber-300">
                                  {user.orders.filter(o => o.orderSource && o.orderSource !== 'WEBSITE').length} offline
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </p>
                      {user.addressLine1 && (
                        <p className="mt-1 text-xs text-slate-300">
                          {user.addressLine1}, {user.city}, {user.country}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                    >
                      {selectedUserId === user.id ? 'Hide Orders' : 'View Orders'}
                    </Button>
                  </div>
                </div>

                {/* User Orders - Expandable */}
                {selectedUserId === user.id && user.orders.length > 0 && (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold text-white">
                      Orders ({user.orders.length}) • {user.orders.filter(o => !o.orderSource || o.orderSource === 'WEBSITE').length} online • {user.orders.filter(o => o.orderSource && o.orderSource !== 'WEBSITE').length} offline
                    </h4>
                    {user.orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm font-semibold text-white">Order #{order.id}</span>
                              <Badge variant={statusVariant[order.status] ?? 'default'}>
                                {order.status}
                              </Badge>
                              {order.orderSource && order.orderSource !== 'WEBSITE' && (
                                <Badge variant="default" className="bg-amber-500/20 text-amber-300 border-amber-500/50">
                                  {order.orderSource === 'INSTAGRAM' ? 'Instagram' :
                                   order.orderSource === 'PHONE' ? 'Phone' :
                                   order.orderSource === 'IN_PERSON' ? 'In Person' :
                                   'Offline'}
                                </Badge>
                              )}
                              {(!order.orderSource || order.orderSource === 'WEBSITE') && (
                                <Badge variant="default" className="bg-brand-500/20 text-brand-300 border-brand-500/50">
                                  Online
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-slate-300">
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
                          <div className="text-right">
                            <p className="text-sm text-slate-300">Total</p>
                            <p className="text-xl font-semibold text-white">{formatCurrency(order.total)}</p>
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <p className="text-xs text-slate-400">
                            Total: {formatCurrency(order.total)} • Status: {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedUserId === user.id && user.orders.length === 0 && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-300">No orders yet</p>
                  </div>
                )}
              </div>
            ))
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-300 mb-2">No users found matching "{searchQuery}"</p>
              <Button variant="ghost" onClick={() => setSearchQuery('')} size="sm">
                Clear Search
              </Button>
            </div>
          ) : (
            <p className="text-sm text-slate-300">No users registered yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminUsersPage;

