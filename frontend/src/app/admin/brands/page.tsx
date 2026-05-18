'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Brand } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  logo: '',
  isActive: true,
};

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands/all');
      setBrands(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingBrand(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim() || undefined,
      logo: form.logo.trim() || undefined,
      isActive: form.isActive,
    };

    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, payload);
      } else {
        await api.post('/brands', payload);
      }
      setShowForm(false);
      resetForm();
      fetchBrands();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save brand');
    }
  };

  const handleDelete = async (brand: Brand) => {
    const count = brand._count?.products ?? 0;
    const msg =
      count > 0
        ? `"${brand.name}" has ${count} product(s). It will be deactivated (hidden from the shop) but products keep their link. Continue?`
        : `Delete "${brand.name}" permanently?`;
    if (!confirm(msg)) return;

    try {
      await api.delete(`/brands/${brand.id}`);
      fetchBrands();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete brand');
    }
  };

  const startEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo: brand.logo || '',
      isActive: brand.isActive !== false,
    });
    setShowForm(true);
    setError('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">Manage manufacturers shown on products and in shop filters.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-accent text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-accent-hover"
        >
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100">
          <h2 className="font-bold mb-4">{editingBrand ? 'Edit' : 'New'} Brand</h2>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="auto-generated from name"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Logo URL</label>
              <input
                type="url"
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
                placeholder="https://… (optional)"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input
                id="brand-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <label htmlFor="brand-active" className="text-sm font-medium">
                Active (visible in shop and product dropdown)
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover"
              >
                {editingBrand ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-6 py-2.5 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Slug</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Description</th>
                <th className="text-left p-4 font-medium">Products</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No brands yet. Add your first brand above.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{brand.name}</td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">{brand.slug}</td>
                    <td className="p-4 text-gray-500 hidden lg:table-cell max-w-xs truncate">
                      {brand.description || '—'}
                    </td>
                    <td className="p-4">{brand._count?.products ?? 0}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          brand.isActive !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {brand.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(brand)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        aria-label={`Edit ${brand.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(brand)}
                        className="p-1.5 text-danger hover:bg-red-50 rounded ml-1"
                        aria-label={`Delete ${brand.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
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
