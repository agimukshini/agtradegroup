'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Store,
  User,
  ShoppingCart,
  Menu,
  X,
  Truck,
  Phone,
  Tag,
  LayoutGrid,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { SearchBar } from '@/components/common/SearchBar';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

const CATEGORY_LINKS = [
  { href: '/shop?category=plumbing', label: 'Plumbing' },
  { href: '/shop?category=heating', label: 'Heating' },
  { href: '/shop?category=tools', label: 'Tools' },
  { href: '/shop?category=building-materials', label: 'Building Materials' },
];

const MAIN_NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Shop', icon: Store },
  { href: '/account', label: 'Account', icon: User },
  { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: true },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  const isAuthPage =
    pathname?.startsWith('/account/login') || pathname?.startsWith('/account/register');

  useEffect(() => setMounted(true), []);

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/shop') return pathname === '/shop' || pathname?.startsWith('/products');
    if (path === '/cart') return pathname === '/cart';
    return pathname?.startsWith(path);
  };

  const navItems = isAuthPage
    ? MAIN_NAV.filter((n) => n.href === '/account' || n.href === '/cart')
    : MAIN_NAV;

  return (
    <header className="storefront-header bg-brand-navy text-white sticky top-0 z-50 shadow-md">
      {/* Top bar — desktop */}
      <div className="bg-brand-dark text-xs leading-normal hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 text-brand-orange shrink-0" aria-hidden />
              Free Delivery in Ferizaj
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" aria-hidden />
              +383 44 123 456
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/contact" className="hover:text-brand-orange transition-colors whitespace-nowrap">
              Support
            </Link>
            <Link href="/account/tracking" className="hover:text-brand-orange transition-colors whitespace-nowrap">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* Main row */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center font-bold text-xl leading-none shrink-0">
              AG
            </div>
            <div className="hidden sm:block shrink-0">
              <div className="font-bold text-xl leading-tight tracking-tight text-white">
                {BRAND_NAME}
              </div>
              <div className="text-[10px] text-gray-300 uppercase tracking-wider mt-0.5 hidden md:block">
                {BRAND_TAGLINE}
              </div>
            </div>
          </Link>

          {!isAuthPage && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 min-w-0">
              <SearchBar variant="header" />
            </div>
          )}

          {isAuthPage && <div className="hidden md:block flex-1" />}

          <div className="flex items-center gap-5 sm:gap-6 shrink-0">
            {navItems.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 shrink-0 transition-colors ${
                  isActive(href) ? 'text-brand-orange' : 'text-white hover:text-brand-orange'
                }`}
              >
                <span className="relative inline-flex shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} aria-hidden />
                  {badge && mounted && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium hidden sm:block">{label}</span>
              </Link>
            ))}

            {!isAuthPage && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:text-brand-orange transition-colors shrink-0"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category strip — desktop, full storefront only */}
      {!isAuthPage && (
        <div className="bg-white text-brand-text border-b border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center space-x-8 overflow-x-auto hide-scroll">
              <Link
                href="/shop"
                className="py-3 text-sm font-medium hover:text-brand-orange flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                All Categories
              </Link>
              {CATEGORY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-sm font-medium hover:text-brand-orange whitespace-nowrap shrink-0"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/shop"
                className="py-3 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1 whitespace-nowrap shrink-0 ml-auto"
              >
                <Tag className="w-4 h-4 shrink-0" />
                Offers
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile search */}
      {!isAuthPage && (
        <div className="md:hidden p-3 bg-brand-navy border-t border-brand-dark">
          <SearchBar variant="mobile" />
        </div>
      )}

      {/* Mobile drawer */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="md:hidden border-t border-brand-dark bg-brand-dark">
          <nav className="px-4 py-3 flex flex-col gap-0.5">
            {[
              { href: '/', label: 'Home', icon: Home },
              { href: '/shop', label: 'Shop', icon: Store },
              { href: '/account', label: 'Account', icon: User },
              { href: '/cart', label: 'Cart', icon: ShoppingCart },
              { href: '/contact', label: 'Contact', icon: Phone },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg text-sm leading-normal ${
                  isActive(href) ? 'bg-brand-navy text-brand-orange' : 'text-gray-200 hover:bg-brand-navy/80'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
