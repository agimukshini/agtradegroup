'use client';

import { ToastProvider } from '@/components/common/Toast';

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
