'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { api } from '@/lib/api';
import {
  calculateShipping,
  formatPrice,
  formatTransportSummary,
  KOSOVO_CITIES,
} from '@/utils/formatters';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const getVatTotal = useCartStore((s) => s.getVatTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryCity: '',
    deliveryAddress: '',
    deliveryZip: '',
    paymentMethod: 'CASH_ON_DELIVERY',
    notes: '',
  });

  const subtotal = getTotal();
  const vat = getVatTotal();
  const shipping = form.deliveryCity ? calculateShipping(form.deliveryCity) : 0;
  const total = subtotal + vat + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.customerName || !form.customerEmail || !form.customerPhone || !form.deliveryCity || !form.deliveryAddress) {
      setError('Please fill in all required fields');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const order = await api.post('/orders', {
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });

      clearCart();
      setOrderCreated(true);
      router.push(`/account/tracking?order=${order.orderNumber}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderCreated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-brand-orange hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-safe">
      <Link href="/cart" className="flex items-center gap-2 text-gray-500 hover:text-brand-orange mb-6 min-h-[44px]">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm h-fit order-1 lg:order-2 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm gap-2">
                <span className="line-clamp-2 flex-1">{item.product.name} × {item.quantity}</span>
                <span className="shrink-0">
                  {formatPrice((item.product.discountPrice ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal (excl. VAT)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {vat > 0 && (
              <div className="flex justify-between">
                <span>VAT (TVSH)</span>
                <span>{formatPrice(vat)}</span>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <span>Transporti:</span>
              <span className="font-medium text-right">{formatTransportSummary()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={form.customerEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Delivery Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City *</label>
                <select
                  name="deliveryCity"
                  value={form.deliveryCity}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
                >
                  <option value="">Select city</option>
                  {KOSOVO_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ZIP Code</label>
                <input
                  type="text"
                  name="deliveryZip"
                  value={form.deliveryZip}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 min-h-[56px] touch-manipulation">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  checked={form.paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={handleChange}
                  className="text-brand-orange"
                />
                <div>
                  <div className="font-medium">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 min-h-[56px] touch-manipulation">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="BANK_TRANSFER"
                  checked={form.paymentMethod === 'BANK_TRANSFER'}
                  onChange={handleChange}
                  className="text-brand-orange"
                />
                <div>
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-sm text-gray-500">Transfer to our bank account</div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Notes (Optional)</h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
              placeholder="Any special instructions..."
            />
          </div>

          {error && <div className="bg-danger/10 text-danger p-4 rounded-lg">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-orange-hover transition-colors disabled:opacity-50 min-h-[52px] touch-manipulation"
          >
            {loading ? 'Processing...' : `Place Order — ${formatPrice(total)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
