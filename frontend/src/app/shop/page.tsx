import { Suspense } from 'react';
import ShopPageClient from './ShopPageClient';
import { Loading } from '@/components/common/Loading';

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20"><Loading /></div>}>
      <ShopPageClient />
    </Suspense>
  );
}
