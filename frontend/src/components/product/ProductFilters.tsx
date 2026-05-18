'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { X } from 'lucide-react';
import type { Category, Brand } from '@/types';

export function ProductFilters({
  categories,
  brands,
  onClose,
}: {
  categories: Category[];
  brands: Brand[];
  onClose?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
    onClose?.();
  };

  const updateFilter = (key: string, value: string) => {
    pushParams({ [key]: value || null });
  };

  const clearAll = () => {
    const search = searchParams.get('search');
    router.push(search ? `/shop?search=${encodeURIComponent(search)}` : '/shop');
    onClose?.();
  };

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const categoryName = categories.find((c) => c.slug === currentCategory)?.name;
  const brandName = brands.find((b) => b.slug === currentBrand)?.name;
  const hasActive = currentCategory || currentBrand || inStockOnly;

  const applyPrice = () => {
    pushParams({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  return (
    <div className="space-y-0">
      {hasActive && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-brand-navy text-base">Active Filters</h3>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-brand-orange hover:text-brand-orange-hover font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCategory && categoryName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-bg border border-gray-200 text-xs font-medium text-brand-text">
                {categoryName}
                <button type="button" onClick={() => updateFilter('category', '')} className="text-gray-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {currentBrand && brandName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-bg border border-gray-200 text-xs font-medium text-brand-text">
                {brandName}
                <button type="button" onClick={() => updateFilter('brand', '')} className="text-gray-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-brand-bg border border-gray-200 text-xs font-medium text-brand-text">
                In Stock
                <button type="button" onClick={() => updateFilter('inStock', '')} className="text-gray-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-5 first:border-t-0 first:pt-0">
        <h3 className="font-bold text-brand-navy mb-4 text-base">Categories</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={!currentCategory}
                onChange={() => updateFilter('category', '')}
              />
              <span className="text-brand-text group-hover:text-brand-orange transition-colors leading-normal">
                All Categories
              </span>
            </label>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={currentCategory === cat.slug}
                  onChange={() => updateFilter('category', currentCategory === cat.slug ? '' : cat.slug)}
                />
                <span
                  className={`group-hover:text-brand-orange transition-colors leading-normal ${
                    currentCategory === cat.slug ? 'font-medium text-brand-text' : 'text-brand-text'
                  }`}
                >
                  {cat.name}
                  {cat._count?.products != null && (
                    <span className="text-gray-400 text-xs ml-1">({cat._count.products})</span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="font-bold text-brand-navy mb-4 text-base">Price Range</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange leading-normal"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange leading-normal"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={applyPrice}
          className="w-full bg-brand-bg border border-gray-300 text-brand-navy hover:bg-gray-50 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Apply Range
        </button>
      </div>

      <div className="border-t border-gray-200 pt-5">
        <h3 className="font-bold text-brand-navy mb-4 text-base">Availability</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="custom-checkbox"
                checked={inStockOnly}
                onChange={() => updateFilter('inStock', inStockOnly ? '' : 'true')}
              />
              <span className="text-brand-text group-hover:text-brand-orange transition-colors leading-normal">
                In Stock
              </span>
            </label>
          </li>
        </ul>
      </div>

      {brands.length > 0 && (
        <div className="border-t border-gray-200 pt-5">
          <h3 className="font-bold text-brand-navy mb-4 text-base">Brands</h3>
          <ul className="space-y-3 text-sm max-h-48 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <li key={brand.id}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={currentBrand === brand.slug}
                    onChange={() => updateFilter('brand', currentBrand === brand.slug ? '' : brand.slug)}
                  />
                  <span
                    className={`group-hover:text-brand-orange transition-colors leading-normal ${
                      currentBrand === brand.slug ? 'font-medium' : ''
                    }`}
                  >
                    {brand.name}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
