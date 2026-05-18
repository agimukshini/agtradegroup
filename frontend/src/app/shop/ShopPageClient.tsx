'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumbs, BreadcrumbBar } from '@/components/common/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Loading } from '@/components/common/Loading';
import type { Pagination as PaginationType, Category, Brand, Product } from '@/types';
import { api } from '@/lib/api';
import { Sliders, ChevronDown, X } from 'lucide-react';
import { SORT_OPTIONS, getSortFromValue, buildShopQuery } from '@/lib/shopParams';

export default function ShopPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const brand = searchParams.get('brand') || '';
  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';
  const sort = searchParams.get('sort') || 'popular';
  const inStock = searchParams.get('inStock') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [pagination, setPagination] = useState<PaginationType>();
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const sortConfig = getSortFromValue(sort);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, brandsRes] = await Promise.all([
          api.get('/products', {
            page,
            limit: '20',
            ...(category ? { category } : {}),
            ...(brand ? { brand } : {}),
            ...(search ? { search } : {}),
            ...(inStock === 'true' ? { inStock: 'true' } : {}),
            ...(minPrice ? { minPrice } : {}),
            ...(maxPrice ? { maxPrice } : {}),
            sortBy: sortConfig.sortBy,
            sortOrder: sortConfig.sortOrder,
          }),
          api.get('/categories'),
          api.get('/brands'),
        ]);
        setProducts(productsRes.products);
        setPagination(productsRes.pagination);
        setCategories(categoriesRes);
        setBrandsList(brandsRes);
      } catch (err) {
        console.error('Failed to fetch shop data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [category, brand, search, page, sort, inStock, minPrice, maxPrice, sortConfig.sortBy, sortConfig.sortOrder]);

  const categoryName = categories.find((c) => c.slug === category)?.name;
  const pageTitle = search ? `Results for "${search}"` : categoryName || 'Professional Tools & Materials';

  const totalProducts = pagination?.totalItems ?? products.length;
  const start = pagination ? (pagination.currentPage - 1) * 20 + 1 : 1;
  const end = pagination ? Math.min(pagination.currentPage * 20, totalProducts) : products.length;

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  const pageLink = (p: number) => {
    const q = buildShopQuery({
      category: category || undefined,
      brand: brand || undefined,
      search: search || undefined,
      sort: sort !== 'popular' ? sort : undefined,
      inStock: inStock || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      page: String(p),
    });
    return `/shop?${q}`;
  };

  const brandName = brandsList.find((b) => b.slug === brand)?.name;
  const activeChips: { key: string; label: string }[] = [];
  if (category && categoryName) activeChips.push({ key: 'category', label: categoryName });
  if (brand && brandName) activeChips.push({ key: 'brand', label: brandName });
  if (inStock === 'true') activeChips.push({ key: 'inStock', label: 'In Stock' });

  const removeChip = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete('page');
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="md:pb-12">
      <BreadcrumbBar>
        <Breadcrumbs
          items={[
            ...(search ? [{ label: `Search: "${search}"` }] : []),
            ...(category && categoryName ? [{ label: categoryName }] : []),
            ...(!search && !category ? [{ label: 'Shop All' }] : []),
          ]}
          className="mb-4"
        />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">{pageTitle}</h1>
            <p className="text-sm text-brand-muted mt-1">
              {loading ? 'Loading products...' : `Showing ${start}-${end} of ${totalProducts} products`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="md:hidden flex-1 bg-white border border-gray-300 text-brand-text font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <Sliders className="w-4 h-4" />
              Filters
            </button>
            <div className="relative flex-1 md:flex-none">
              <select
                value={sort}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full md:w-48 appearance-none bg-white border border-gray-300 text-brand-text font-medium py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange text-sm cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-brand-muted">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </BreadcrumbBar>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <ProductFilters categories={categories} brands={brandsList} />
        </aside>

        <div className="flex-1 min-w-0">
          {activeChips.length > 0 && (
            <div className="md:hidden flex flex-wrap gap-2 mb-4">
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-bg border border-gray-200 text-xs font-medium text-brand-text"
                >
                  {chip.label}
                  <button type="button" onClick={() => removeChip(chip.key)} className="text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-brand-muted text-lg">No products found</p>
              <Link href="/shop" className="text-brand-orange hover:underline mt-2 inline-block font-medium">
                View all products
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} variant="grid" />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2 flex-wrap">
                  {pagination.hasPrev && (
                    <Link
                      href={pageLink(pagination.currentPage - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                    >
                      ‹
                    </Link>
                  )}
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    let p = i + 1;
                    if (pagination.totalPages > 7) {
                      const cur = pagination.currentPage;
                      p = Math.max(1, Math.min(cur - 3 + i, pagination.totalPages - 6 + i));
                    }
                    return (
                      <Link
                        key={p}
                        href={pageLink(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium ${
                          p === pagination.currentPage
                            ? 'bg-brand-navy text-white border-brand-navy'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                  {pagination.hasNext && (
                    <Link
                      href={pageLink(pagination.currentPage + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                    >
                      ›
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showFilters && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setShowFilters(false)}
            aria-hidden
          />
          <div
            className={`md:hidden fixed bottom-0 left-0 w-full bg-white rounded-t-2xl z-[70] bottom-sheet max-h-[85vh] flex flex-col ${
              showFilters ? 'open' : ''
            }`}
          >
            <div className="px-4 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-bold text-brand-navy">Filters</h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-brand-navy hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <ProductFilters categories={categories} brands={brandsList} onClose={() => setShowFilters(false)} />
            </div>
            <div className="p-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => {
                  router.push('/shop');
                  setShowFilters(false);
                }}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-brand-navy"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-lg font-medium"
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
