'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard, CategorySectionHeader } from '@/components/product/CategoryCard';
import { FeaturedCarousel } from '@/components/product/FeaturedCarousel';
import { ArrowRight, Truck, Tags, Boxes } from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import type { Product, Category } from '@/types';
import { api } from '@/lib/api';
import { HERO_BG_IMAGE, HERO_PRODUCTS_IMAGE } from '@/lib/categoryImages';

const DEFAULT_CATEGORIES = [
  { slug: 'plumbing', name: 'Plumbing' },
  { slug: 'heating', name: 'Heating' },
  { slug: 'tools', name: 'Power Tools' },
  { slug: 'building-materials', name: 'Building Materials' },
  { slug: 'hand-tools', name: 'Hand Tools' },
  { slug: 'electrical', name: 'Electrical' },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featured, cats] = await Promise.all([
          api.get('/products/featured', { limit: '8' }),
          api.get('/categories'),
        ]);
        setFeaturedProducts(Array.isArray(featured) ? featured : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayCategories: { slug: string; name: string; image?: string | null }[] =
    categories.length >= 4
      ? categories.slice(0, 6).map((c) => ({ slug: c.slug, name: c.name, image: c.image }))
      : DEFAULT_CATEGORIES;

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '38344123456';

  return (
    <div className="flex flex-col">
      <div className="bg-brand-orange text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
        <Truck className="w-4 h-4 shrink-0" />
        <span>Free Delivery in Ferizaj on all orders over €50!</span>
      </div>

      <section className="relative hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <img src={HERO_BG_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32 relative z-10 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Professional Grade <br />
              <span className="text-brand-orange">Materials & Tools</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-lg mx-auto md:mx-0">
              Your trusted supplier for plumbing, heating, and construction materials in Kosovo. Built for
              contractors, available to everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link
                href="/shop"
                className="bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-4 px-8 rounded-lg shadow-sm transition-colors text-center h-14 flex items-center justify-center gap-2 text-lg"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="bg-transparent hover:bg-white/10 border-2 border-white text-white font-semibold py-4 px-8 rounded-lg transition-colors text-center h-14 flex items-center justify-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 mt-12 md:mt-0 hidden md:block">
            <img
              src={HERO_PRODUCTS_IMAGE}
              alt="Professional tools and materials"
              className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl mx-auto"
            />
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 w-full">
        <CategorySectionHeader title="Shop by Category" subtitle="Everything you need for your next project" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {displayCategories.map((cat) => (
            <CategoryCard key={cat.slug} slug={cat.slug} name={cat.name} image={cat.image} />
          ))}
        </div>
      </section>

      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <CategorySectionHeader title="Featured Products" subtitle="Top picks for contractors this week" />
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="min-w-[260px] h-80 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-brand-bg rounded-xl border border-gray-100">
              <p className="text-brand-muted mb-4">Browse our full catalog of professional supplies.</p>
              <Link href="/shop" className="text-brand-orange font-semibold hover:underline">
                Go to Shop
              </Link>
            </div>
          ) : (
            <FeaturedCarousel products={featuredProducts} />
          )}
        </div>
      </section>

      <section id="why-choose-us" className="py-16 max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-brand-navy">Built for Professionals</h2>
          <p className="text-brand-muted mt-2 max-w-2xl mx-auto text-sm">
            We understand the demands of the trade. That&apos;s why we offer specialized services to keep your projects
            running smoothly.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Truck,
              color: 'bg-blue-50 text-brand-navy',
              title: 'Fast Site Delivery',
              desc: 'Same-day delivery available for orders placed before 12 PM in the Ferizaj region directly to your site.',
            },
            {
              icon: Tags,
              color: 'bg-orange-50 text-brand-orange',
              title: 'Trade Pricing',
              desc: 'Register as a contractor to access exclusive B2B pricing, bulk discounts, and flexible payment terms.',
            },
            {
              icon: Boxes,
              color: 'bg-green-50 text-green-600',
              title: 'Huge Inventory',
              desc: "Over 10,000 products in stock locally. If we don't have it, we'll source it for you within 48 hours.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white p-8 rounded-2xl border border-gray-100 product-card text-center flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${f.color}`}>
                <f.icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-brand-navy text-lg mb-3">{f.title}</h3>
              <p className="text-sm text-brand-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="whatsapp-banner" className="max-w-7xl mx-auto px-4 pb-16 w-full">
        <div className="bg-[#128C7E] rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="z-10 text-center md:text-left mb-6 md:mb-0 md:max-w-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Need a custom quote?</h2>
            <p className="text-green-50 text-sm md:text-base">
              Send us your materials list on WhatsApp and our sales team will get back to you with a competitive quote
              within 2 hours.
            </p>
          </div>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="z-10 shrink-0 bg-white text-[#128C7E] hover:bg-gray-50 font-bold py-4 px-8 rounded-lg shadow-sm transition-colors h-14 flex items-center justify-center gap-3 text-lg whitespace-nowrap"
          >
            <MessageCircle className="w-6 h-6" />
            Message Us Now
          </a>
        </div>
      </section>
    </div>
  );
}
