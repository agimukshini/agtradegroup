/** Kosovo TVSH rates — keep in sync with backend/src/constants/kosovoVat.ts */
export const KOSOVO_VAT_RATES = [
  { value: '', label: 'No VAT / not applicable' },
  { value: '18', label: '18% — Standard rate (TVSH)' },
  { value: '8', label: '8% — Reduced rate' },
  { value: '0', label: '0% — Zero-rated' },
] as const;

export const KOSOVO_VAT_HELP =
  'Prices are entered excl. VAT. Kosovo TVSH: 18% standard; 8% reduced (utilities, basic foods, books, etc.); 0% zero-rated (exports, etc.). Leave empty if VAT does not apply.';
