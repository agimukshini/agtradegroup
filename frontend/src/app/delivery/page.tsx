import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Truck, Clock, MapPin } from 'lucide-react';
import { KOSOVO_CITIES, formatPrice } from '@/utils/formatters';

export default function DeliveryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Delivery Information' }]} />

      <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-8">Delivery Information</h1>

      {/* Free Delivery Banner */}
      <div className="bg-brand-orange text-white rounded-xl p-8 mb-8 text-center">
        <Truck className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Free Delivery in Ferizaj!</h2>
        <p className="text-lg text-orange-100">All orders delivered within Ferizaj are completely free</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Delivery Rates */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Delivery Rates</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-success" />
                <div>
                  <div className="font-semibold">Ferizaj</div>
                  <div className="text-sm text-gray-500">All areas</div>
                </div>
              </div>
              <span className="font-bold text-success text-lg">FREE</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-navy" />
                <div>
                  <div className="font-semibold">Rest of Kosovo</div>
                  <div className="text-sm text-gray-500">All cities</div>
                </div>
              </div>
              <span className="font-bold text-brand-navy text-lg">2.00 EUR</span>
            </div>
          </div>
        </div>

        {/* Delivery Times */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Delivery Times</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-orange flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold">Ferizaj</div>
                <div className="text-gray-600">Same day or next day delivery</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand-orange flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold">Other cities</div>
                <div className="text-gray-600">1-2 business days</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Orders placed before 2:00 PM are typically shipped the same day.
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Area */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4">We Deliver To</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {KOSOVO_CITIES.map(city => (
            <div key={city} className={`p-3 rounded-lg text-sm ${city.toLowerCase() === 'ferizaj' ? 'bg-green-50 text-green-700 font-medium' : 'bg-gray-50'}`}>
              {city} {city.toLowerCase() === 'ferizaj' && '— FREE'}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'How do I track my order?', a: 'You can track your order using the tracking number provided in your order confirmation, or through your account dashboard.' },
            { q: 'Can I pick up my order in person?', a: 'Yes! You can pick up your order from our warehouse in Ferizaj. Select "Pickup" at checkout.' },
            { q: 'What if I need bulk delivery?', a: 'For bulk orders or special delivery requirements, contact us via WhatsApp or phone and we will arrange it.' },
            { q: 'Do you deliver on weekends?', a: 'Standard delivery is Monday-Saturday. Special arrangements can be made for urgent orders.' },
          ].map((faq, i) => (
            <div key={i} className="border-b pb-4 last:border-b-0">
              <h3 className="font-semibold mb-1">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

