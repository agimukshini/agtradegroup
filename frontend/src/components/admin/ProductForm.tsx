'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import type { Brand, Category, Product } from '@/types';
import { KOSOVO_VAT_HELP, KOSOVO_VAT_RATES } from '@/constants/kosovoVat';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';

export type ProductFormValues = {
  name: string;
  sku: string;
  barcode: string;
  shortDescription: string;
  description: string;
  price: string;
  discountPrice: string;
  vatRate: string;
  stockQuantity: string;
  lowStockThreshold: string;
  categoryId: string;
  brandId: string;
  status: string;
  isFeatured: boolean;
};

const emptyForm: ProductFormValues = {
  name: '',
  sku: '',
  barcode: '',
  shortDescription: '',
  description: '',
  price: '',
  discountPrice: '',
  vatRate: '',
  stockQuantity: '0',
  lowStockThreshold: '10',
  categoryId: '',
  brandId: '',
  status: 'ACTIVE',
  isFeatured: false,
};

type Props = {
  productId?: string | null;
  categories: Category[];
  brands: Brand[];
  onSuccess: () => void;
  onCancel: () => void;
};

type ExistingImage = { id: string; url: string; alt?: string | null };

export function ProductForm({ productId, categories, brands, onSuccess, onCancel }: Props) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!productId) {
      setForm(emptyForm);
      setExistingImages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    api
      .get(`/admin/products/${productId}`)
      .then((product: Product & { categoryId?: string; brandId?: string | null }) => {
        setForm({
          name: product.name,
          sku: product.sku,
          barcode: product.barcode || '',
          shortDescription: product.shortDescription || '',
          description: product.description || '',
          price: String(product.price),
          discountPrice: product.discountPrice != null ? String(product.discountPrice) : '',
          vatRate: product.vatRate != null ? String(product.vatRate) : '',
          stockQuantity: String(product.stockQuantity),
          lowStockThreshold: String(product.lowStockThreshold),
          categoryId: product.categoryId || categories.find((c) => c.slug === product.category?.slug)?.id || '',
          brandId: product.brandId || brands.find((b) => b.slug === product.brand?.slug)?.id || '',
          status: product.status || 'ACTIVE',
          isFeatured: product.isFeatured,
        });
        setExistingImages(product.images || []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [productId, categories, brands]);

  useEffect(() => {
    const urls = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newFiles]);

  const set = (key: keyof ProductFormValues, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const picked = Array.from(files).filter((f) => allowed.includes(f.type));
    if (picked.length < files.length) {
      setError('Some files were skipped. Only JPEG, PNG, WebP, and GIF are allowed.');
    }
    setNewFiles((prev) => [...prev, ...picked].slice(0, 10));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!productId) return;
    if (!confirm('Remove this image?')) return;
    try {
      await api.delete(`/products/${productId}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove image');
    }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name.trim());
    fd.append('sku', form.sku.trim());
    fd.append('barcode', form.barcode.trim());
    fd.append('shortDescription', form.shortDescription.trim());
    fd.append('description', form.description.trim());
    fd.append('price', form.price);
    if (form.discountPrice) fd.append('discountPrice', form.discountPrice);
    fd.append('vatRate', form.vatRate);
    fd.append('stockQuantity', form.stockQuantity);
    fd.append('lowStockThreshold', form.lowStockThreshold);
    fd.append('categoryId', form.categoryId);
    if (form.brandId) fd.append('brandId', form.brandId);
    fd.append('status', form.status);
    if (form.isFeatured) fd.append('isFeatured', 'true');
    newFiles.forEach((file) => fd.append('images', file));
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!productId && newFiles.length === 0) {
      setError('Add at least one product image.');
      return;
    }

    setSaving(true);
    try {
      const fd = buildFormData();
      if (productId) {
        await api.putFormData(`/products/${productId}`, fd);
      } else {
        await api.postFormData('/products', fd);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading product…
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">{productId ? 'Edit Product' : 'New Product'}</h2>
        <button type="button" onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input
              type="text"
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input
              type="text"
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select
              value={form.brandId}
              onChange={(e) => set('brandId', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sale price (€)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.discountPrice}
              onChange={(e) => set('discountPrice', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">VAT rate (TVSH)</label>
            <select
              value={form.vatRate}
              onChange={(e) => set('vatRate', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              {KOSOVO_VAT_RATES.map((opt) => (
                <option key={opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1.5">{KOSOVO_VAT_HELP}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock quantity *</label>
            <input
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => set('stockQuantity', e.target.value)}
              required
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Low stock alert at</label>
            <input
              type="number"
              min="0"
              value={form.lowStockThreshold}
              onChange={(e) => set('lowStockThreshold', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            >
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer py-2.5">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="custom-checkbox"
              />
              <span className="text-sm font-medium">Featured on homepage</span>
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Short description</label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => set('shortDescription', e.target.value)}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
              placeholder="Shown on product cards"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Full description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent resize-y"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Images</label>
          <p className="text-xs text-gray-500 mb-3">
            JPEG, PNG, WebP, or GIF — up to 10 images, 5MB each. First image is the main photo.
          </p>

          <div className="flex flex-wrap gap-3 mb-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative w-24 h-24 rounded-lg border bg-gray-50 overflow-hidden group">
                <img src={resolveMediaUrl(img.url)} alt="" className="w-full h-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(img.id)}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  aria-label="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {previews.map((src, i) => (
              <div key={src} className="relative w-24 h-24 rounded-lg border bg-gray-50 overflow-hidden group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  aria-label="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-accent hover:text-accent transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            Add images
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-white px-6 py-2.5 rounded-lg font-medium hover:bg-accent-hover disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {productId ? 'Save changes' : 'Create product'}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
