const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/** Origin for uploaded files (strips /api/v1 from API URL). */
export function getUploadOrigin(): string {
  return API_URL.replace(/\/api\/v1\/?$/, '');
}

/** Resolve product image paths (served via API or Next /uploads proxy). */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/uploads/')) {
    // Browser: same-origin /uploads rewrite avoids cross-origin image blocking
    if (typeof window !== 'undefined') return url;
    const site = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '');
    if (site) return `${site}${url}`;
    return `${getUploadOrigin()}${url}`;
  }
  return url;
}
