const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';
const ROLE_KEY = 'userRole';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setSession(accessToken: string, refreshToken: string, role?: string) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  if (role) sessionStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(ROLE_KEY);
}

export function isAdminRole(role: string | undefined | null): boolean {
  return role === 'ADMIN' || role === 'STAFF';
}

export function getCachedRole(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ROLE_KEY);
}

let refreshInFlight: Promise<boolean> | null = null;

/** Exchange refresh token for a new access token (single flight). */
export async function refreshSession(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data.accessToken || !data.refreshToken) return false;
        setSession(data.accessToken, data.refreshToken, getCachedRole() || undefined);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}
