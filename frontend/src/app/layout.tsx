import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { StorefrontProviders } from '@/components/layout/StorefrontProviders';
import { MobileNavController } from '@/components/layout/MobileNavController';
import { BRAND_DESCRIPTION, BRAND_TITLE } from '@/lib/brand';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: BRAND_TITLE,
  description: BRAND_DESCRIPTION,
  keywords:
    'plumbing, heating, tools, construction, building materials, pipes, radiators, power tools, Kosovo, Ferizaj, AG Trade Group',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AG Trade',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3a5f' },
    { media: '(prefers-color-scheme: dark)', color: '#152943' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.className} min-h-screen flex flex-col bg-brand-bg text-brand-text antialiased`}>
        <StorefrontProviders>
          <Header />
          <main className="storefront-main flex-1 w-full min-w-0">{children}</main>
          <Footer />
          <WhatsAppButton />
          <MobileNavController />
        </StorefrontProviders>
      </body>
    </html>
  );
}
