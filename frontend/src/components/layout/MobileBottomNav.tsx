'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, User, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { showsMobileBottomNav } from '@/lib/mobile';

const TABS = [
  { href: '/', label: 'Home', icon: Home, match: (p: string) => p === '/' },
  { href: '/shop', label: 'Shop', icon: Store, match: (p: string) => p === '/shop' || p.startsWith('/products') },
  {
    href: '/account',
    label: 'Account',
    icon: User,
    match: (p: string) =>
      p.startsWith('/account') && !p.startsWith('/account/login') && !p.startsWith('/account/register'),
  },
  { href: '/cart', label: 'Cart', icon: ShoppingCart, match: (p: string) => p === '/cart' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());

  useEffect(() => setMounted(true), []);

  if (!showsMobileBottomNav(pathname)) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 px-2 sm:px-6 py-2 flex justify-around items-stretch pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      aria-label="Main navigation"
    >
      {TABS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname || '');
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[48px] min-w-[56px] px-2 py-1 rounded-xl transition-colors relative touch-manipulation ${
              active ? 'text-brand-orange' : 'text-brand-muted hover:text-brand-orange'
            }`}
          >
            <div className="relative">
              <Icon className="w-6 h-6" strokeWidth={active ? 2.25 : 2} aria-hidden />
              {href === '/cart' && mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-orange text-white text-[10px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
