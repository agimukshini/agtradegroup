import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className = '' }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav className={`flex text-sm text-brand-muted ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 overflow-x-auto whitespace-nowrap hide-scroll">
        <li className="inline-flex items-center">
          <Link href="/" className="hover:text-brand-orange flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i}>
            <div className="flex items-center">
              <ChevronRight className="w-3 h-3 mx-1 flex-shrink-0" />
              {item.href ? (
                <Link href={item.href} className="hover:text-brand-orange ml-1 md:ml-2 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-brand-navy font-medium ml-1 md:ml-2 truncate max-w-[200px] sm:max-w-none">
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BreadcrumbBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">{children}</div>
    </div>
  );
}
