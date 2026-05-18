import { api } from '@/lib/api';
import { setSession } from '@/lib/authSession';

export type OAuthProviderName = 'google' | 'facebook' | 'apple';

export type OAuthConfig = {
  google: { enabled: boolean; clientId: string | null };
  facebook: { enabled: boolean; appId: string | null };
  apple: { enabled: boolean; clientId: string | null; redirectUri: string | null };
};

export async function fetchOAuthConfig(): Promise<OAuthConfig> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const res = await fetch(`${base}/auth/oauth/config`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Could not load sign-in options');
  }
  return res.json();
}

export async function signInWithOAuth(
  provider: OAuthProviderName,
  credential: string,
  name?: { firstName?: string; lastName?: string }
) {
  return api.post(
    '/auth/oauth',
    { provider, credential, ...name },
    { skipAuth: true }
  );
}

export function applyAuthResult(
  result: { accessToken: string; refreshToken: string; user: { role: string } },
  router: { push: (path: string) => void }
) {
  setSession(result.accessToken, result.refreshToken, result.user.role);
  if (result.user.role === 'ADMIN' || result.user.role === 'STAFF') {
    window.location.href = '/admin';
    return;
  }
  router.push('/account');
}
