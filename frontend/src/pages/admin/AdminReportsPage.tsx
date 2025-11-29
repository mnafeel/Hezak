import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import Card from '../../components/ui/Card';
import { useAdminOverview } from '../../hooks/useAdminOverview';
import { useAdminOrders } from '../../hooks/useAdminOrders';
import { formatCurrency } from '../../lib/utils';

const AdminReportsPage = () => {
  const { data: overview } = useAdminOverview();
  const { data: orders = [] } = useAdminOrders();

  const statusData = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(statusData).map(([status, count]) => ({
    status,
    count
  }));

  const revenueByCustomer = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.user.name] = (acc[order.user.name] ?? 0) + order.total;
    return acc;
  }, {});

  const topCustomers = Object.entries(revenueByCustomer)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <Card title="Performance summary">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-200">Total revenue</p>
            <p className="text-3xl font-semibold text-white">
              {formatCurrency(overview?.totalRevenue ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-200">Orders placed</p>
            <p className="text-3xl font-semibold text-white">
              {overview ? overview.totalOrders.toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-200">Customers served</p>
            <p className="text-3xl font-semibold text-white">
              {overview ? overview.totalUsers.toLocaleString() : '0'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card title="Orders by status">
          {chartData.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="status" stroke="#cbd5f5" />
                  <YAxis stroke="#cbd5f5" />
                  <Tooltip
                    contentStyle={{
                      background: '#0f172a',
                      borderRadius: 16,
                      border: '1px solid rgba(148,163,184,0.2)'
                    }}
                  />
                  <Bar dataKey="count" fill="#EC4899" radius={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-300">Orders will populate this chart when available.</p>
          )}
        </Card>

        <Card title="Top patrons">
          {topCustomers.length ? (
            <ul className="space-y-3 text-sm text-slate-200">
              {topCustomers.map((customer) => (
                <li
                  key={customer.name}
                  className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3"
                >
                  <span>{customer.name}</span>
                  <span>{formatCurrency(customer.total)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-300">Customer insights will appear once orders flow in.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsPage;

