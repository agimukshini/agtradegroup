'use client';

import Link from 'next/link';
import { ShoppingCart, Star, CheckCircle } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, getDiscountPercentage, isInStock } from '@/utils/formatters';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/common/Toast';
import { resolveMediaUrl } from '@/lib/media';

function StarRating({ count = 42 }: { count?: number }) {
  return (
    <div className="flex items-center gap-1 mb-2">
      <div className="flex text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-current' : 'text-gray-200'}`} />
        ))}
      </div>
      <span className="text-[10px] text-brand-muted">({count})</span>
    </div>
  );
}

type ProductCardProps = {
  product: Product;
  variant?: 'carousel' | 'grid';
};

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToast();
  const discount = getDiscountPercentage(product.price, product.discountPrice);
  const inStock = isInStock(product);
  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];
  const displayPrice = product.discountPrice ?? product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inStock) {
      addItem(product);
      showToast(`${product.name} added to cart`);
    }
  };

  const isCarousel = variant === 'carousel';
  const wrapperClass = isCarousel
    ? 'min-w-[260px] max-w-[260px] snap-start'
    : '';

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-4 product-card flex flex-col h-full ${wrapperClass} ${
        !inStock && variant === 'grid' ? 'opacity-90' : ''
      }`}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={`relative mb-4 aspect-square bg-gray-50 rounded-lg p-4 flex items-center justify-center overflow-hidden ${
            variant === 'grid' ? 'group' : ''
          }`}
        >
          {discount > 0 && (
            <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.isFeatured && !discount && (
            <span className="absolute top-2 left-2 z-10 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded">
              Bestseller
            </span>
          )}
          {variant === 'grid' && inStock && (
            <span className="absolute top-2 right-2 z-10 text-green-500 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle className="w-4 h-4 fill-green-500 text-white" />
            </span>
          )}
          {!inStock && (
            <span className="absolute inset-0 z-10 bg-white/40 flex items-center justify-center text-xs font-bold text-brand-navy">
              Out of Stock
            </span>
          )}
          {primaryImage ? (
            <img
              src={resolveMediaUrl(primaryImage.url)}
              alt={primaryImage.alt || product.name}
              className={`w-full h-full object-contain ${variant === 'grid' ? 'group-hover:scale-105 transition-transform' : ''}`}
              loading="lazy"
            />
          ) : (
            <span className="text-4xl opacity-40">🔧</span>
          )}
        </div>
      </Link>

      <div className="flex-1 flex flex-col">
        <p className="text-xs text-brand-muted mb-1 truncate">
          {product.brand?.name || product.category?.name || 'Product'}
        </p>
        {variant === 'grid' && (
          <p className="text-[10px] text-brand-muted mb-1">SKU: {product.sku}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-brand-navy text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem] hover:text-brand-orange">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto">
          <StarRating />
          <div className="flex items-end gap-2 mb-4">
            <span className="text-lg font-bold text-brand-navy">{formatPrice(displayPrice)}</span>
            {product.discountPrice != null && (
              <span className="text-xs text-gray-400 line-through mb-1">{formatPrice(product.price)}</span>
            )}
          </div>
          {inStock ? (
            <button
              type="button"
              onClick={handleAdd}
              className="w-full bg-brand-navy hover:bg-brand-dark text-white text-sm font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              className="w-full block text-center border border-brand-navy text-brand-navy hover:bg-gray-50 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
