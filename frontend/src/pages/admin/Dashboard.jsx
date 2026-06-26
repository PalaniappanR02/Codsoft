import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Clock, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { base44 } from '@/api/apiClient';
import { useSettings } from '@/lib/SettingsContext';
import { formatCurrency, formatDate, statusColors } from '@/lib/format';

export default function Dashboard() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Order.list('-created_date', 200).catch(() => []),
      base44.entities.Product.filter({ active: true }, '-created_date', 500).catch(() => []),
    ]).then(([o, p]) => {
      setOrders(o || []);
      setProducts(p || []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const today = new Date().toDateString();
    const ordersToday = orders.filter(o => new Date(o.created_date).toDateString() === today);
    const pending = orders.filter(o => o.status === 'pending').length;
    return { revenue, ordersToday: ordersToday.length, totalProducts: products.length, pending };
  }, [orders, products]);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toDateString();
      const dayOrders = orders.filter(o => new Date(o.created_date).toDateString() === dayStr);
      days.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayOrders.reduce((s, o) => s + (o.total || 0), 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [orders]);

  const recentOrders = orders.slice(0, 5);
  const lowStock = products.filter(p => p.track_inventory && p.stock_qty <= (p.low_stock_threshold || 5)).slice(0, 5);

  const kpiCards = [
    { label: 'Total Revenue', value: formatCurrency(stats.revenue, settings), icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { label: 'Orders Today', value: stats.ordersToday, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending Orders', value: stats.pending, icon: Clock, color: 'bg-amber-100 text-amber-600' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-muted border-t-brand rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono-price">{kpi.value}</p>
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Low Stock */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand" /> Revenue (Last 7 Days)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(243, 75%, 59%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="name" stroke="hsl(220 9% 41%)" fontSize={12} />
              <YAxis stroke="hsl(220 9% 41%)" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 91%)', fontSize: '12px' }}
                formatter={(value) => [formatCurrency(value, settings), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(243, 75%, 59%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Low Stock */}
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Low Stock Alert
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All products well stocked</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {p.sku || 'N/A'}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${p.stock_qty <= 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {p.stock_qty} left
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/inventory" className="block text-center text-sm text-brand hover:underline mt-3">
            Manage Inventory →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-brand hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground p-8 text-center">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-t border-border hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-mono-price font-medium">{o.order_number}</td>
                    <td className="px-4 py-3">{o.customer_name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{formatDate(o.created_date)}</td>
                    <td className="px-4 py-3 font-mono-price font-medium">{formatCurrency(o.total, settings)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors(o.status)}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}