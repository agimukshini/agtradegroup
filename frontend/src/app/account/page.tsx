'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { clearSession, isAdminRole } from '@/lib/authSession';
import type { User, Order } from '@/types';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/account/login');
      return;
    }

    async function fetchData() {
      try {
        const userRes = await api.get('/auth/me');
        setUser(userRes);
        try {
          const ordersRes = await api.get('/orders', { page: '1', limit: '10' });
          setOrders(ordersRes.orders || []);
        } catch {
          setOrders([]);
        }
      } catch {
        clearSession();
        router.push('/account/login');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {}
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>;
  if (!user) return null;

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">My Account</h1>
        <div className="flex items-center gap-4">
          {isAdminRole(user.role) && (
            <Link href="/admin" className="text-sm font-medium text-accent hover:underline">
              Admin Panel →
            </Link>
          )}
          <button type="button" onClick={handleLogout} className="text-sm text-danger hover:underline">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-gray-500">Name:</span> {user.firstName} {user.lastName}</div>
            <div><span className="text-gray-500">Email:</span> {user.email}</div>
            <div><span className="text-gray-500">Phone:</span> {user.phone || 'Not set'}</div>
          </div>
        </div>

        {/* Orders */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-bold mb-4">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">No orders yet. <Link href="/shop" className="text-brand-orange hover:underline">Start shopping</Link></p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">Order #{order.orderNumber}</div>
                      <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{order.items.length} item(s)</span>
                    <span className="font-bold">{order.total} EUR</span>
                  </div>
                  <div className="mt-2">
                    <Link href={`/account/tracking?order=${order.trackingNumber}`} className="text-sm text-brand-orange hover:underline">Track Order →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

