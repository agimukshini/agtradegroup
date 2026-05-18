export const KOSOVO_CITIES = [
  'Ferizaj', 'Prishtina', 'Prizren', 'Gjilan', 'Gjakova', 'Peja',
  'Mitrovica', 'Podujeva', 'Vushtrri', 'Fushe Kosove', 'Suhareke',
  'Rahovec', 'Drenas', 'Lipjan', 'Kastriot', 'Kamenice', 'Viti',
  'Klin', 'Shtime', 'Malisheve', 'Skenderaj', 'Decan',
];

export const FREE_DELIVERY_CITY = process.env.NEXT_PUBLIC_FREE_DELIVERY_CITY || 'Ferizaj';
export const DELIVERY_FEE = parseFloat(process.env.NEXT_PUBLIC_DELIVERY_FEE || '2');
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || 'EUR';

export const DELIVERY_METHOD_STANDARD = 'STANDARD';

export function calculateShipping(city: string): number {
  return city.toLowerCase() === FREE_DELIVERY_CITY.toLowerCase() ? 0 : DELIVERY_FEE;
}

export function formatTransportSummary(): string {
  return `(${DELIVERY_METHOD_STANDARD} - falas)`;
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} ${CURRENCY}`;
}

export function isInStock(product: { stockQuantity: number }): boolean {
  return product.stockQuantity > 0;
}

export function getDiscountPercentage(price: number, discountPrice: number | null | undefined): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}

export function getProductUnitPrice(product: {
  price: number;
  discountPrice?: number | null;
}): number {
  return product.discountPrice ?? product.price;
}

export function calculateLineVat(netAmount: number, vatRate: number | null | undefined): number {
  if (vatRate == null || vatRate <= 0) return 0;
  return Math.round(netAmount * (vatRate / 100) * 100) / 100;
}

export function calculateCartVat(
  items: { quantity: number; product: { price: number; discountPrice?: number | null; vatRate?: number | null } }[]
): number {
  const total = items.reduce((sum, item) => {
    const net = getProductUnitPrice(item.product) * item.quantity;
    return sum + calculateLineVat(net, item.product.vatRate);
  }, 0);
  return Math.round(total * 100) / 100;
}

export function formatVatRateLabel(vatRate: number | null | undefined): string {
  if (vatRate == null) return '';
  return `incl. ${vatRate}% TVSH`;
}
