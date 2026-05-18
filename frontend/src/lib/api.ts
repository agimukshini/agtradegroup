import { getAccessToken, refreshSession } from './authSession';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  skipJsonContentType?: boolean;
  skipAuth?: boolean;
  _retried?: boolean;
}

function authHeaders(options: { skipJson?: boolean; skipAuth?: boolean } = {}): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!options.skipJson) headers['Content-Type'] = 'application/json';
  if (typeof window !== 'undefined' && !options.skipAuth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { params, headers, skipJsonContentType, skipAuth, _retried, ...rest } = options;

  const url = new URL(`${API_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    cache: 'no-store',
    ...rest,
    headers: {
      ...authHeaders({ skipJson: skipJsonContentType === true, skipAuth }),
      ...headers,
    },
  });

  if (response.status === 401 && !skipAuth && !_retried) {
    const renewed = await refreshSession();
    if (renewed) {
      return fetchApi(endpoint, { ...options, _retried: true });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const details = Array.isArray(error.details)
      ? error.details.map((d: { message?: string }) => d.message).filter(Boolean).join('. ')
      : '';
    const message =
      [error.error, error.message, details].filter(Boolean).join(': ') || `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function fetchMultipart(
  endpoint: string,
  formData: FormData,
  options: { method?: 'POST' | 'PUT'; query?: Record<string, string> } = {}
) {
  const method = options.method ?? 'POST';
  const url = new URL(`${API_URL}${endpoint}`);
  if (options.query) {
    Object.entries(options.query).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  let retried = false;
  const doFetch = async () => {
    const token = typeof window !== 'undefined' ? getAccessToken() : null;
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(url.toString(), {
      method,
      cache: 'no-store',
      headers,
      body: formData,
    });
  };

  let response = await doFetch();
  if (response.status === 401 && !retried) {
    const renewed = await refreshSession();
    if (renewed) {
      retried = true;
      response = await doFetch();
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const details = Array.isArray(error.details)
      ? error.details.map((d: { message?: string }) => d.message).filter(Boolean).join('. ')
      : '';
    const message =
      [error.error, error.message, details].filter(Boolean).join(': ') || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  get: (endpoint: string, params?: Record<string, string>) => fetchApi(endpoint, { method: 'GET', params }),
  post: (endpoint: string, body?: unknown, options?: { skipAuth?: boolean }) =>
    fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body), skipAuth: options?.skipAuth }),
  put: (endpoint: string, body?: unknown) =>
    fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint: string) => fetchApi(endpoint, { method: 'DELETE' }),
  postFormData: (endpoint: string, formData: FormData) =>
    fetchMultipart(endpoint, formData, { method: 'POST' }),
  putFormData: (endpoint: string, formData: FormData) =>
    fetchMultipart(endpoint, formData, { method: 'PUT' }),
  importProducts: (formData: FormData, options: { updateExisting?: boolean } = {}) => {
    const query: Record<string, string> = {};
    if (options.updateExisting) query.updateExisting = 'true';
    return fetchMultipart('/products/import', formData, { query });
  },
  async downloadProductImportTemplate() {
    let retried = false;
    const doFetch = async () => {
      const token = typeof window !== 'undefined' ? getAccessToken() : null;
      return fetch(`${API_URL}/products/import/template`, {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    };

    let response = await doFetch();
    if (response.status === 401 && !retried) {
      const renewed = await refreshSession();
      if (renewed) {
        retried = true;
        response = await doFetch();
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Download failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.blob();
  },
};
