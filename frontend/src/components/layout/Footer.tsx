'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import { BRAND_NAME } from '@/lib/brand';
import { showsMobileBottomNav } from '@/lib/mobile';

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const mobileNav = showsMobileBottomNav(pathname);

  return (
    <footer
      className={`storefront-footer bg-brand-navy text-white pt-12 border-t-4 border-brand-orange mt-auto ${
        mobileNav ? 'md:pb-6' : 'pb-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-orange rounded flex items-center justify-center font-bold text-sm leading-none shrink-0">
                AG
              </div>
              <div className="font-bold text-lg text-white shrink-0">{BRAND_NAME}</div>
            </div>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">
              Your trusted partner for plumbing, heating, and construction materials in Kosovo.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center hover:bg-brand-orange transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-full bg-brand-dark flex items-center justify-center hover:bg-brand-orange transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/about" className="hover:text-brand-orange transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-orange transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-brand-orange transition-colors">
                  Delivery Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-orange transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/shop?category=plumbing" className="hover:text-brand-orange transition-colors">
                  Plumbing Supplies
                </Link>
              </li>
              <li>
                <Link href="/shop?category=heating" className="hover:text-brand-orange transition-colors">
                  Heating Systems
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tools" className="hover:text-brand-orange transition-colors">
                  Professional Tools
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=building-materials"
                  className="hover:text-brand-orange transition-colors"
                >
                  Building Materials
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-brand-orange shrink-0" aria-hidden />
                <span>
                  Industrial Zone, Ferizaj
                  <br />
                  Kosovo 70000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" aria-hidden />
                <span>+383 44 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" aria-hidden />
                <span>info@agtradegroup.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-brand-dark flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 leading-normal">
          <p>&copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-white transition-colors whitespace-nowrap">
              Privacy Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors whitespace-nowrap">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
