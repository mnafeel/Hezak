import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAdminOverview } from '../../hooks/useAdminOverview';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { formatCurrency, formatDate } from '../../lib/utils';

const AdminDashboardPage = () => {
  const { data: overview } = useAdminOverview();
  const { data: orders = [] } = useAdminOrders();
  const { data: products = [] } = useAdminProducts();

  const chartData = orders.slice(0, 10).map((order) => ({
    name: formatDate(order.createdAt),
    revenue: order.total
  }));

  const lowInventory = products.filter((product) => product.inventory < 5).slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Total revenue"
          value={overview?.totalRevenue ?? 0}
          format="currency"
          className="bg-gradient-to-br from-brand-500/40 to-transparent"
        />
        <StatCard label="Orders" value={overview?.totalOrders ?? 0} />
        <StatCard label="Customers" value={overview?.totalUsers ?? 0} />
      </div>

      <Card title="Revenue trend">
        {chartData.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" stroke="#cbd5f5" />
                <YAxis stroke="#cbd5f5" />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    borderRadius: 16,
                    border: '1px solid rgba(148,163,184,0.2)'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-300">No orders yet to display revenue trends.</p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Recent orders">
          <div className="space-y-4">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{order.user.name}</p>
                    <p className="text-xs text-slate-300">{order.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{formatDate(order.createdAt)}</p>
                    <p className="font-semibold text-white">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">Orders will appear here once placed.</p>
            )}
          </div>
        </Card>

        <Card title="Low inventory alerts">
          <div className="space-y-3">
            {lowInventory.length ? (
              lowInventory.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">{product.name}</p>
                    <p className="text-xs text-slate-300">{product.category?.name ?? 'Unassigned'}</p>
                  </div>
                  <Badge variant="warning">{product.inventory} left</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">All inventories are healthy.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


