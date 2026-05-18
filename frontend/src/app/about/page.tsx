import Link from 'next/link';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <div className="max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">About AG Trade Group</h1>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-600 mb-6">
            AG Trade Group is Kosovo&apos;s trusted supplier of professional plumbing, heating, tools, and construction materials. 
            Based in Ferizaj, we serve contractors, installers, and homeowners across the country.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-600 mb-6">
            We provide high-quality products from trusted brands at competitive prices, with fast and reliable delivery 
            across Kosovo. Our goal is to make professional-grade materials accessible to everyone — from individual 
            homeowners to large construction companies.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4">What We Offer</h2>
          <ul className="space-y-2 text-gray-600 mb-6">
            <li>✅ Complete range of plumbing supplies — pipes, fittings, valves, and accessories</li>
            <li>✅ Heating systems — radiators, boilers, floor heating, and circulation pumps</li>
            <li>✅ Bathroom equipment — taps, showers, toilets, and fixtures</li>
            <li>✅ Professional tools — pipe wrenches, cutters, soldering kits, and more</li>
            <li>✅ Construction accessories — insulation, sealants, and building materials</li>
          </ul>

          <h2 className="text-xl font-bold mt-8 mb-4">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { title: 'Fast Delivery', desc: 'Free in Ferizaj, only 2€ across Kosovo' },
              { title: 'Quality Brands', desc: 'Rehau, Viega, Bosch, Grohe, Grundfos & more' },
              { title: 'Expert Advice', desc: 'Our team helps you choose the right products' },
              { title: 'Bulk Pricing', desc: 'Special prices for contractors and large orders' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            Have questions or need a quote? Contact us via phone, email, or WhatsApp.
          </p>
          <p className="text-gray-600">
            📞 +383 44 123 456<br />
            📧 info@agtradegroup.com<br />
            📍 Ferizaj, Kosovo
          </p>

          <div className="mt-8">
            <Link href="/shop" className="bg-brand-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-orange-hover transition-colors inline-block">
              Browse Our Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
