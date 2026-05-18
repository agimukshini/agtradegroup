/** Shared mobile layout rules (storefront bottom nav, safe areas). */

export function isAdminPath(pathname: string | null | undefined): boolean {
  return Boolean(pathname?.startsWith('/admin'));
}

export function isAuthFormPath(pathname: string | null | undefined): boolean {
  return (
    pathname === '/account/login' ||
    pathname === '/account/register' ||
    pathname === '/admin/login'
  );
}

/** Fixed bottom tab bar on phones (hidden from md breakpoint up). */
export function showsMobileBottomNav(pathname: string | null | undefined): boolean {
  if (!pathname || isAdminPath(pathname) || isAuthFormPath(pathname)) return false;
  if (pathname === '/checkout') return false;
  return true;
}

export function isProductDetailPath(pathname: string | null | undefined): boolean {
  return Boolean(pathname?.startsWith('/products/'));
}
