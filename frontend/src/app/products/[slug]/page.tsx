'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs, BreadcrumbBar } from '@/components/common/Breadcrumbs';
import { ProductCard } from '@/components/product/ProductCard';
import {
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Store,
  Star,
  AlertTriangle,
  ZoomIn,
} from 'lucide-react';
import type { Product } from '@/types';
import { api } from '@/lib/api';
import { resolveMediaUrl } from '@/lib/media';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, getDiscountPercentage, isInStock } from '@/utils/formatters';
import { Loading } from '@/components/common/Loading';
import { useToast } from '@/components/common/Toast';

function StarRow() {
  return (
    <div className="flex text-yellow-400 text-sm">
      {Array.from({ length: 4 }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-current" />
      ))}
      <Star className="w-4 h-4 fill-current opacity-50" />
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'description'>('specs');
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToast();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [productRes, relatedRes] = await Promise.all([
          api.get(`/products/slug/${slug}`),
          api.get(`/products/slug/${slug}/related`, { limit: '4' }),
        ]);
        setProduct(productRes);
        setRelated(Array.isArray(relatedRes) ? relatedRes : []);
        setSelectedImage(0);
        setQuantity(1);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchData();
  }, [slug]);

  if (loading) return <Loading />;
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-brand-navy">Product not found</h1>
        <Link href="/shop" className="text-brand-orange mt-4 inline-block hover:underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const inStock = isInStock(product);
  const discount = getDiscountPercentage(product.price, product.discountPrice);
  const specs = product.specs as Record<string, string> | null;
  const images = product.images.length > 0 ? product.images : [];
  const mainImage = images[selectedImage] || images[0];
  const lowStock = inStock && product.stockQuantity > 0 && product.stockQuantity <= 5;

  const addToCart = () => {
    if (inStock) {
      addItem(product, quantity);
      showToast(`${product.name} added to cart`);
    }
  };

  return (
    <div className="md:pb-12">
      <BreadcrumbBar>
        <Breadcrumbs
          items={[
            { label: 'Shop', href: '/shop' },
            { label: product.category.name, href: `/shop?category=${product.category.slug}` },
            { label: product.name },
          ]}
          className="overflow-x-auto hide-scroll whitespace-nowrap"
        />
      </BreadcrumbBar>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12">
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square bg-white border border-gray-200 rounded-2xl p-4 md:p-8 flex items-center justify-center overflow-hidden">
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                    -{discount}% OFF
                  </span>
                )}
                {product.isFeatured && (
                  <span className="bg-brand-orange text-white text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider">
                    Bestseller
                  </span>
                )}
              </div>
              {mainImage ? (
                <img
                  src={resolveMediaUrl(mainImage.url)}
                  alt={mainImage.alt || product.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-6xl opacity-30">🔧</span>
              )}
              <button
                type="button"
                className="absolute bottom-4 right-4 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-brand-navy hover:text-brand-orange shadow-sm"
                aria-label="Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scroll pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 md:w-24 md:h-24 shrink-0 bg-white border-2 rounded-xl p-2 transition-all ${
                      selectedImage === i
                        ? 'border-brand-orange opacity-100'
                        : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveMediaUrl(img.url)} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/2 flex flex-col">
            <div className="mb-6 border-b border-gray-200 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                <span className="text-sm text-brand-muted font-medium">SKU: {product.sku}</span>
                {lowStock && (
                  <span className="bg-yellow-100 text-[#F59E0B] text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-yellow-200">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Low Stock (Only {product.stockQuantity} left)
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy mb-4 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <StarRow />
                  <span className="text-sm text-brand-muted ml-1">Reviews</span>
                </div>
                {product.brand && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="text-sm text-brand-navy font-medium">Brand: {product.brand.name}</span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl md:text-5xl font-bold text-brand-navy">
                  {formatPrice(product.discountPrice ?? product.price)}
                </span>
                {product.discountPrice != null && (
                  <span className="text-sm text-gray-400 line-through mb-1">{formatPrice(product.price)}</span>
                )}
              </div>
              {product.vatRate != null && (
                <p className="text-xs text-brand-muted mb-2">
                  Prices excl. {product.vatRate}% TVSH (Kosovo VAT)
                </p>
              )}
              <p className="text-sm text-brand-muted">
                Volume pricing available for contractors.{' '}
                <Link href="/account/login" className="text-brand-orange hover:underline font-medium">
                  Log in to view.
                </Link>
              </p>
            </div>

            <div className="bg-brand-bg border border-gray-200 rounded-xl p-4 mb-8 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-brand-navy shrink-0 mt-1" />
                <div>
                  <span className="block text-sm font-bold text-brand-navy">Free Delivery to Ferizaj</span>
                  <span className="block text-xs text-brand-muted">€2 delivery elsewhere in Kosovo</span>
                </div>
              </div>
              <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                <Store className="w-5 h-5 text-brand-navy shrink-0 mt-1" />
                <div>
                  <span className="block text-sm font-bold text-brand-navy">Click & Collect</span>
                  <span className="block text-xs text-brand-muted">Ferizaj depot — ready in 30 mins</span>
                </div>
              </div>
            </div>

            {product.shortDescription && (
              <p className="text-brand-muted text-sm mb-6 leading-relaxed">{product.shortDescription}</p>
            )}

            <div className="hidden md:flex flex-col gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-14 w-32 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-full text-center text-lg font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addToCart}
                  disabled={!inStock}
                  className="flex-1 h-14 bg-brand-orange hover:bg-brand-orange-hover disabled:bg-gray-200 text-white text-lg font-bold rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-3 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {(specs && Object.keys(specs).length > 0) || product.description ? (
          <div className="mt-12 border-t border-gray-200 pt-8 max-w-4xl">
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              {specs && Object.keys(specs).length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
                    activeTab === 'specs'
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-brand-muted'
                  }`}
                >
                  Specifications
                </button>
              )}
              {product.description && (
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 text-sm font-semibold border-b-2 -mb-px ${
                    activeTab === 'description'
                      ? 'border-brand-orange text-brand-orange'
                      : 'border-transparent text-brand-muted'
                  }`}
                >
                  Description
                </button>
              )}
            </div>
            {activeTab === 'specs' && specs ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-100 last:border-0">
                        <th className="text-left px-6 py-4 bg-brand-bg/50 font-medium text-brand-navy capitalize w-1/3">
                          {key.replace(/_/g, ' ')}
                        </th>
                        <td className="px-6 py-4">{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-brand-muted leading-relaxed">{product.description}</div>
            )}
          </div>
        ) : null}

        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} variant="grid" />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden fixed left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mobile-sticky-buy">
        <div className="flex gap-2 max-w-lg mx-auto">
          <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden h-12 w-24 bg-white">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-full text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
              className="w-8 h-full flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={addToCart}
            disabled={!inStock}
            className="flex-1 h-12 bg-brand-orange disabled:bg-gray-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
