'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Truck } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatTransportSummary, FREE_DELIVERY_CITY } from '@/utils/formatters';
import { Breadcrumbs, BreadcrumbBar } from '@/components/common/Breadcrumbs';
import { resolveMediaUrl } from '@/lib/media';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getTotal = useCartStore((s) => s.getTotal);
  const getVatTotal = useCartStore((s) => s.getVatTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getTotal();
  const vat = getVatTotal();
  const total = subtotal + vat;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400 mx-auto">
          <ShoppingCart className="w-14 h-14" />
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2">Your cart is empty</h1>
        <p className="text-brand-muted mb-8 max-w-md mx-auto">
          Looks like you haven&apos;t added any items to your cart yet. Explore our products to find what you need.
        </p>
        <Link
          href="/shop"
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-orange-500/30 inline-flex items-center gap-2"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <BreadcrumbBar>
        <Breadcrumbs items={[{ label: 'My Cart' }]} />
      </BreadcrumbBar>

      <div className="max-w-7xl mx-auto px-4 py-8 md:pb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-8">
          My Cart ({items.length} {items.length === 1 ? 'Item' : 'Items'})
        </h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {items.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              const lineTotal = price * item.quantity;
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center relative product-card"
                >
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors bg-red-50 p-2 rounded-full"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/products/${item.product.slug}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-brand-bg rounded-xl p-2 flex items-center justify-center flex-shrink-0 border border-gray-100"
                  >
                    {item.product.images[0] ? (
                      <img
                        src={resolveMediaUrl(item.product.images[0].url)}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-3xl">🔧</span>
                    )}
                  </Link>

                  <div className="flex-1 flex flex-col gap-2 w-full">
                    <div className="pr-10">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-bold text-brand-navy text-lg leading-tight hover:text-brand-orange transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-brand-muted mt-1">SKU: {item.product.sku}</p>
                      {item.product.shortDescription && (
                        <span className="inline-block mt-2 bg-brand-bg text-brand-navy text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200">
                          {item.product.shortDescription}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10 w-28 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-full flex items-center justify-center text-brand-navy hover:bg-gray-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-full text-center font-bold text-brand-navy text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockQuantity}
                          className="w-8 h-full flex items-center justify-center text-brand-navy hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xl font-bold text-brand-navy">{formatPrice(lineTotal)}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex justify-between items-center mt-4">
              <Link
                href="/shop"
                className="text-brand-orange hover:text-brand-orange-hover font-medium text-sm flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="text-brand-muted hover:text-red-500 font-medium text-sm transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:sticky lg:top-32 shadow-sm">
              <h2 className="text-xl font-bold text-brand-navy mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
                <div className="flex justify-between text-brand-muted text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium text-brand-navy">{formatPrice(subtotal)}</span>
                </div>
                {vat > 0 && (
                  <div className="flex justify-between text-brand-muted text-sm">
                    <span>VAT (TVSH)</span>
                    <span className="font-medium text-brand-navy">{formatPrice(vat)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-muted text-sm gap-4">
                  <span>Transporti:</span>
                  <span className="font-medium text-brand-navy text-right">
                    {formatTransportSummary()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-brand-navy">Total (excl. delivery)</span>
                <span className="text-3xl font-bold text-brand-navy">{formatPrice(total)}</span>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-500/30 flex items-center justify-center mb-6"
              >
                Checkout
              </Link>

              <div className="bg-brand-bg rounded-xl p-4 flex items-start gap-3 border border-gray-100">
                <Truck className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-brand-navy">Delivery to {FREE_DELIVERY_CITY}</p>
                  <p className="text-xs text-brand-muted mt-1">Order within 2 hrs for delivery tomorrow.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
