'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { Package, Truck, CheckCircle } from 'lucide-react';

const statusSteps = [
  { key: 'PENDING', label: 'Order Placed', icon: Package },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PROCESSING', label: 'Processing', icon: Package },
  { key: 'SHIPPED', label: 'Shipped', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInput, setTrackingInput] = useState(orderNumber || '');

  useEffect(() => {
    if (orderNumber) {
      trackOrder(orderNumber);
    }
  }, [orderNumber]);

  const trackOrder = async (query: string) => {
    setLoading(true);
    try {
      let result = await api.get(`/orders/track/${query}`);
      if (!result) {
        result = await api.get(`/orders/track/${query}`);
      }
      setOrder(result);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(trackingInput);
  };

  const currentStatusIndex = order ? statusSteps.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-center">Track Your Order</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8">
        <input
          type="text"
          value={trackingInput}
          onChange={(e) => setTrackingInput(e.target.value)}
          placeholder="Enter order number or tracking number"
          className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-orange focus:border-brand-navy"
        />
        <button type="submit" className="bg-brand-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors">
          Track
        </button>
      </form>

      {loading && <Loading />}

      {!loading && !order && trackingInput && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">No order found with this number</p>
        </div>
      )}

      {!loading && order && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
              <p className="text-sm text-gray-500">Tracking: {order.trackingNumber}</p>
            </div>
            <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full font-medium text-sm">{order.status}</span>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
            <div className="absolute top-5 left-0 h-0.5 bg-accent transition-all" style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }} />
            {statusSteps.map((step, i) => {
              const isComplete = i <= currentStatusIndex;
              const isCurrent = i === currentStatusIndex;
              return (
                <div key={step.key} className="relative flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? 'bg-brand-orange text-white' : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-brand-orange/20' : ''}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 ${isCurrent ? 'font-bold text-brand-orange' : 'text-gray-500'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Order Details */}
          <div className="border-t pt-6">
            <h3 className="font-bold mb-4">Order Details</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{item.total} EUR</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{order.subtotal} EUR</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingFee} EUR</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{order.total} EUR</span></div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <div>Deliver to: {order.deliveryAddress}, {order.deliveryCity}</div>
              <div>Payment: {order.paymentMethod.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<Loading />}>
      <TrackingContent />
    </Suspense>
  );
}

