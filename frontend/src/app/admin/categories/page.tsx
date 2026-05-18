'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: '', sortOrder: '0' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      setCategories(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setShowForm(false);
      setEditingCategory(null);
      setForm({ name: '', slug: '', description: '', parentId: '', sortOrder: '0' });
      fetchCategories();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const startEdit = (category: any) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || '',
      sortOrder: String(category.sortOrder),
    });
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => { setShowForm(true); setEditingCategory(null); setForm({ name: '', slug: '', description: '', parentId: '', sortOrder: '0' }); }} className="bg-accent text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-accent-hover">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-bold mb-4">{editingCategory ? 'Edit' : 'New'} Category</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" placeholder="auto-generated" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Parent Category</label>
              <select value={form.parentId} onChange={e => setForm({...form, parentId: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent">
                <option value="">None (Top Level)</option>
                {categories.filter(c => !c.parentId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm({...form, sortOrder: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover">{editingCategory ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Slug</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Parent</th>
                <th className="text-left p-4 font-medium">Sort</th>
                <th className="text-right p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className={`border-b last:border-b-0 hover:bg-gray-50 ${cat.parentId ? 'pl-8' : ''}`}>
                    <td className="p-4 font-medium">{cat.parentId ? '└ ' : ''}{cat.name}</td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">{cat.slug}</td>
                    <td className="p-4 text-gray-500 hidden sm:table-cell">{categories.find(c => c.id === cat.parentId)?.name || '-'}</td>
                    <td className="p-4">{cat.sortOrder}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => startEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-danger hover:bg-red-50 rounded ml-1"><Trash2 className="w-4 h-4" /></button>
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
