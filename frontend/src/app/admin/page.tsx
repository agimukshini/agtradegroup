'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, lowStockRes] = await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/inventory/low-stock'),
        ]);
        setStats(statsRes);
        setLowStock(lowStockRes);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: TrendingUp, color: 'text-success', bg: 'bg-green-50' },
          { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Customers', value: stats?.totalCustomers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-accent', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h2 className="font-bold">Low Stock Alerts ({lowStock.length})</h2>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-gray-500 text-sm">All products are well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${item.stockQuantity <= 5 ? 'text-danger' : 'text-warning'}`}>
                      {item.stockQuantity} left
                    </div>
                    <div className="text-xs text-gray-400">Threshold: {item.lowStockThreshold}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-accent hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 5).map((order: any) => (
              <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <div className="font-medium text-sm">#{order.orderNumber}</div>
                  <div className="text-xs text-gray-500">{order.customerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{order.total} EUR</div>
                  <div className="text-xs text-gray-400">{order.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      {stats?.ordersByStatus && (
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <h2 className="font-bold mb-4">Orders by Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {stats.ordersByStatus.map((group: any) => (
              <div key={group.status} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{group._count.id}</div>
                <div className="text-sm text-gray-500">{group.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
