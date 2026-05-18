'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { isProductDetailPath, showsMobileBottomNav } from '@/lib/mobile';

/** Sets document data attributes for global mobile CSS + renders bottom nav. */
export function MobileNavController() {
  const pathname = usePathname();

  useEffect(() => {
    const nav = showsMobileBottomNav(pathname);
    const sticky = nav && isProductDetailPath(pathname);

    if (nav) {
      document.documentElement.dataset.mobileNav = 'on';
    } else {
      delete document.documentElement.dataset.mobileNav;
    }

    if (sticky) {
      document.documentElement.dataset.mobileSticky = 'on';
    } else {
      delete document.documentElement.dataset.mobileSticky;
    }

    return () => {
      delete document.documentElement.dataset.mobileNav;
      delete document.documentElement.dataset.mobileSticky;
    };
  }, [pathname]);

  return <MobileBottomNav />;
}
