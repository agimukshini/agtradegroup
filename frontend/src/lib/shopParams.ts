export const SORT_OPTIONS = [
  { label: 'Most Popular', value: 'popular', sortBy: 'createdAt', sortOrder: 'desc' as const },
  { label: 'Price: Low to High', value: 'price-asc', sortBy: 'price', sortOrder: 'asc' as const },
  { label: 'Price: High to Low', value: 'price-desc', sortBy: 'price', sortOrder: 'desc' as const },
  { label: 'Newest Arrivals', value: 'newest', sortBy: 'createdAt', sortOrder: 'desc' as const },
];

export function getSortFromValue(value: string) {
  return SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];
}

export function buildShopQuery(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  return q.toString();
}
