'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

export function FeaturedCarousel({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div className="hidden sm:flex gap-2 absolute -top-14 right-0">
        <button
          type="button"
          onClick={() => scroll(-1)}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-navy hover:bg-gray-50 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-brand-navy hover:bg-gray-50 transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 hide-scroll snap-x snap-mandatory"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="carousel" />
        ))}
      </div>
    </div>
  );
}
