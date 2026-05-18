/** Kosovo TVSH rates per Law No. 05/L-037 (VAT) and ATK guidance. */
export const KOSOVO_VAT_RATES = [
  { value: 18, label: '18% — Standard rate (TVSH)' },
  { value: 8, label: '8% — Reduced rate' },
  { value: 0, label: '0% — Zero-rated' },
] as const;

export const KOSOVO_VAT_RATE_VALUES: readonly number[] = KOSOVO_VAT_RATES.map((r) => r.value);

export const KOSOVO_VAT_REDUCED_NOTE =
  'Reduced 8% applies to e.g. water, electricity, waste services, grain, dairy, edible salt, eggs, educational books, certain medical devices.';

export const KOSOVO_VAT_ZERO_NOTE =
  'Zero-rated 0% applies to e.g. exports, international transport, diplomatic supplies, gold to CBK.';

export function isAllowedKosovoVatRate(rate: number): boolean {
  return KOSOVO_VAT_RATE_VALUES.includes(rate);
}
