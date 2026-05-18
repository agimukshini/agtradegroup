'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers', { page: '1', limit: '100' });
      setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/customers/${userId}/role`, { role });
      fetchCustomers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Email</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Phone</th>
                <th className="text-left p-4 font-medium">Role</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Registered</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customers found</td></tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{customer.firstName} {customer.lastName}</td>
                    <td className="p-4 hidden md:table-cell">{customer.email}</td>
                    <td className="p-4 hidden sm:table-cell">{customer.phone || '-'}</td>
                    <td className="p-4">
                      <select
                        value={customer.role}
                        onChange={(e) => updateRole(customer.id, e.target.value)}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 hidden lg:table-cell">{new Date(customer.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
