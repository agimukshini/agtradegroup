import { isAllowedKosovoVatRate } from '../constants/kosovoVat';

export function parseVatRateInput(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = parseFloat(String(value));
  if (Number.isNaN(n)) return null;
  if (!isAllowedKosovoVatRate(n)) {
    throw new Error('VAT rate must be 0, 8, or 18 (Kosovo TVSH), or left empty');
  }
  return n;
}

/** Prices are excl. VAT; TVSH is added on top of the line net amount. */
export function calculateLineVat(netAmount: number, vatRate: number | null | undefined): number {
  if (vatRate == null || vatRate <= 0) return 0;
  return roundMoney(netAmount * (vatRate / 100));
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatProductVatRate(vatRate: unknown): number | null {
  if (vatRate == null) return null;
  const n = Number(vatRate);
  return Number.isNaN(n) ? null : n;
}
