'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  isAdminRole,
  refreshSession,
  setSession,
} from '@/lib/authSession';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Tag,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/brands', label: 'Brands', icon: Tag },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'redirecting'>('loading');

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const token = getAccessToken();
      if (!token) {
        setStatus('redirecting');
        router.replace('/admin/login');
        return;
      }

      try {
        const profile = await api.get('/auth/me');
        if (cancelled) return;

        if (!isAdminRole(profile.role)) {
          setStatus('redirecting');
          router.replace('/account');
          return;
        }

        const token = getAccessToken();
        const refresh = getRefreshToken();
        if (token && refresh) setSession(token, refresh, profile.role);
        setUser(profile);
        setStatus('ready');
      } catch {
        if (cancelled) return;
        const renewed = await refreshSession();
        if (renewed && !cancelled) {
          try {
            const profile = await api.get('/auth/me');
            if (cancelled) return;
            if (!isAdminRole(profile.role)) {
              setStatus('redirecting');
              router.replace('/account');
              return;
            }
            setUser(profile);
            setStatus('ready');
            return;
          } catch {
            // fall through to login
          }
        }
        setStatus('redirecting');
        router.replace('/admin/login');
      }
    }

    loadSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogout = async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }, { skipAuth: true });
      }
    } catch {
      // still sign out locally
    }
    clearSession();
    setUser(null);
    setStatus('redirecting');
    window.location.href = '/admin/login';
  };

  if (status !== 'ready' || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
        {status === 'redirecting' ? 'Redirecting…' : 'Loading…'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold">AGT</div>
              <div>
                <div className="font-bold">Admin Panel</div>
                <div className="text-xs text-gray-300">{user.role}</div>
              </div>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                pathname === item.href ? 'bg-white/10 text-accent' : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/5 w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b px-4 md:px-6 py-4 flex items-center justify-between">
          <button type="button" onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-500 hidden sm:inline">
              {user.firstName} {user.lastName}
            </span>
            <Link href="/" className="text-sm text-accent hover:underline">
              View Store →
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 pb-safe min-w-0 overflow-x-hidden">{children}</main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
