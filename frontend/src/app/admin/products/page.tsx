'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { formatPrice } from '@/utils/formatters';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductBulkImport } from '@/components/admin/ProductBulkImport';
import type { Brand, Category, Product } from '@/types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

type AdminProduct = Product & {
  categoryId?: string;
  brandId?: string | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products', {
        page: '1',
        limit: '100',
        ...(search.trim() ? { search: search.trim() } : {}),
      });
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')])
      .then(([cats, brs]) => {
        setCategories(cats || []);
        setBrands(brs || []);
      })
      .catch(console.error);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this product? It will be hidden from the store.')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditingId(product.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSaved = () => {
    closeForm();
    fetchProducts();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-gray-500 mt-1">Add and manage catalog items with photos</p>
          </div>
          {!showForm && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openCreate}
                className="bg-accent text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-accent-hover"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
              <ProductBulkImport onComplete={fetchProducts} />
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          productId={editingId}
          categories={categories}
          brands={brands}
          onSuccess={handleSaved}
          onCancel={closeForm}
        />
      )}

      {!showForm && (
        <>
          <form
            className="mb-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              fetchProducts();
            }}
          >
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>
            <button type="submit" className="px-4 py-2 border rounded-lg font-medium hover:bg-gray-50">
              Search
            </button>
          </form>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="admin-table-wrap overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium w-16" />
                    <th className="text-left p-4 font-medium">Product</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">SKU</th>
                    <th className="text-left p-4 font-medium">Price</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">VAT</th>
                    <th className="text-left p-4 font-medium">Stock</th>
                    <th className="text-left p-4 font-medium hidden sm:table-cell">Category</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No products found. Click Add Product to create one.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const thumb = product.images?.[0];
                      return (
                        <tr key={product.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="w-12 h-12 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                              {thumb ? (
                                <img
                                  src={resolveMediaUrl(thumb.url)}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-lg opacity-40">📦</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{product.name}</div>
                            {product.isFeatured && (
                              <span className="text-[10px] uppercase tracking-wide text-accent font-semibold">
                                Featured
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-gray-500 hidden md:table-cell">{product.sku}</td>
                          <td className="p-4">{formatPrice(product.price)}</td>
                          <td className="p-4 text-gray-500 hidden lg:table-cell">
                            {product.vatRate != null ? `${product.vatRate}%` : '—'}
                          </td>
                          <td className="p-4">
                            <span
                              className={
                                product.stockQuantity <= product.lowStockThreshold
                                  ? 'text-danger font-medium'
                                  : ''
                              }
                            >
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 hidden sm:table-cell">
                            {product.category?.name || '—'}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={() => openEdit(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              aria-label="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 text-danger hover:bg-red-50 rounded ml-1"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
