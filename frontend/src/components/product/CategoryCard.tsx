import Link from 'next/link';
import { getCategoryImage } from '@/lib/categoryImages';
import { ChevronRight } from 'lucide-react';

export function CategoryCard({ slug, name, image }: { slug: string; name: string; image?: string | null }) {
  const imgSrc = getCategoryImage(slug, image);

  return (
    <Link href={`/shop?category=${slug}`} className="group flex flex-col items-center">
      <div className="w-full aspect-square bg-white rounded-xl product-card flex items-center justify-center p-6 mb-3 border border-gray-100">
        <img
          src={imgSrc}
          alt={name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <span className="font-medium text-brand-navy text-sm text-center group-hover:text-brand-orange transition-colors px-1">
        {name}
      </span>
    </Link>
  );
}

export function CategorySectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex justify-between items-end mb-8">
      <div>
        <h2 className="text-2xl font-bold text-brand-navy">{title}</h2>
        <p className="text-brand-muted mt-1 text-sm">{subtitle}</p>
      </div>
      <Link
        href="/shop"
        className="text-brand-navy hover:text-brand-orange font-medium text-sm hidden sm:flex items-center gap-1"
      >
        View All <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
