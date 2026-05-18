'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

type SearchBarProps = {
  variant?: 'header' | 'mobile' | 'default';
  className?: string;
};

export function SearchBar({ variant = 'default', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (variant === 'header') {
    return (
      <form onSubmit={handleSearch} className={`relative flex-1 max-w-2xl ${className}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products, tools, materials..."
          className="w-full h-11 pl-4 pr-12 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-orange border-none bg-white"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-11 w-12 text-brand-navy hover:text-brand-orange flex items-center justify-center rounded-r-lg transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>
    );
  }

  if (variant === 'mobile') {
    return (
      <form onSubmit={handleSearch} className={`relative w-full ${className}`}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full h-10 pl-4 pr-10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-orange border-none bg-white text-sm"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-10 w-10 text-brand-navy flex items-center justify-center rounded-r-lg"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, tools, materials..."
        className="w-full h-10 pl-4 pr-10 rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-orange border-none bg-white text-sm"
      />
      <button
        type="submit"
        className="absolute right-0 top-0 h-10 w-10 text-brand-navy flex items-center justify-center rounded-r-lg"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
      </button>
    </form>
  );
}
