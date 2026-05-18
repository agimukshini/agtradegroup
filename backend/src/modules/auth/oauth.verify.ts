import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { env } from '../../config/env';

export type OAuthProviderName = 'google' | 'facebook' | 'apple';

export type OAuthProfile = {
  provider: OAuthProviderName;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
};

const appleJwks = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  cacheMaxAge: 86400000,
});

function getAppleSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    appleJwks.getSigningKey(kid, (err, key) => {
      if (err || !key) {
        reject(err ?? new Error('Apple signing key not found'));
        return;
      }
      resolve(key.getPublicKey());
    });
  });
}

export async function verifyGoogleIdToken(idToken: string): Promise<OAuthProfile> {
  if (!env.googleClientId) {
    throw new Error('Google sign-in is not configured');
  }

  const client = new OAuth2Client(env.googleClientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error('Invalid Google account');
  }
  if (payload.email_verified === false) {
    throw new Error('Google email is not verified');
  }

  const name = payload.name?.trim() || '';
  const parts = name.split(/\s+/).filter(Boolean);

  return {
    provider: 'google',
    providerId: payload.sub,
    email: payload.email.toLowerCase(),
    firstName: payload.given_name || parts[0] || 'User',
    lastName: payload.family_name || parts.slice(1).join(' ') || '',
    avatarUrl: payload.picture,
  };
}

export async function verifyFacebookAccessToken(accessToken: string): Promise<OAuthProfile> {
  if (!env.facebookAppId || !env.facebookAppSecret) {
    throw new Error('Facebook sign-in is not configured');
  }

  const debugUrl = new URL('https://graph.facebook.com/debug_token');
  debugUrl.searchParams.set('input_token', accessToken);
  debugUrl.searchParams.set('access_token', `${env.facebookAppId}|${env.facebookAppSecret}`);

  const debugRes = await fetch(debugUrl);
  const debugData = (await debugRes.json()) as {
    data?: { is_valid?: boolean; app_id?: string; user_id?: string };
  };

  if (!debugRes.ok || !debugData.data?.is_valid) {
    throw new Error('Invalid Facebook token');
  }
  if (debugData.data.app_id !== env.facebookAppId) {
    throw new Error('Facebook token app mismatch');
  }

  const profileUrl = new URL('https://graph.facebook.com/me');
  profileUrl.searchParams.set(
    'fields',
    'id,email,first_name,last_name,picture.type(large)'
  );
  profileUrl.searchParams.set('access_token', accessToken);

  const profileRes = await fetch(profileUrl);
  const profile = (await profileRes.json()) as {
    id?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    picture?: { data?: { url?: string } };
    error?: { message?: string };
  };

  if (!profileRes.ok || !profile.id) {
    throw new Error(profile.error?.message || 'Could not load Facebook profile');
  }
  if (!profile.email) {
    throw new Error('Facebook account must share an email address');
  }

  return {
    provider: 'facebook',
    providerId: profile.id,
    email: profile.email.toLowerCase(),
    firstName: profile.first_name?.trim() || 'User',
    lastName: profile.last_name?.trim() || '',
    avatarUrl: profile.picture?.data?.url,
  };
}

export async function verifyAppleIdentityToken(
  identityToken: string,
  name?: { firstName?: string; lastName?: string }
): Promise<OAuthProfile> {
  if (!env.appleClientId) {
    throw new Error('Apple sign-in is not configured');
  }

  const decoded = jwt.decode(identityToken, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid Apple identity token');
  }

  const signingKey = await getAppleSigningKey(decoded.header.kid);
  const payload = jwt.verify(identityToken, signingKey, {
    algorithms: ['RS256'],
    issuer: 'https://appleid.apple.com',
    audience: env.appleClientId,
  }) as {
    sub: string;
    email?: string;
    email_verified?: string | boolean;
  };

  const email =
    typeof payload.email === 'string' ? payload.email.toLowerCase() : undefined;
  if (!email) {
    throw new Error('Apple account must share an email address');
  }

  const emailVerified =
    payload.email_verified === true || payload.email_verified === 'true';
  if (!emailVerified) {
    throw new Error('Apple email is not verified');
  }

  return {
    provider: 'apple',
    providerId: payload.sub,
    email,
    firstName: name?.firstName?.trim() || 'User',
    lastName: name?.lastName?.trim() || '',
  };
}

export async function verifyOAuthCredential(
  provider: OAuthProviderName,
  credential: string,
  name?: { firstName?: string; lastName?: string }
): Promise<OAuthProfile> {
  switch (provider) {
    case 'google':
      return verifyGoogleIdToken(credential);
    case 'facebook':
      return verifyFacebookAccessToken(credential);
    case 'apple':
      return verifyAppleIdentityToken(credential, name);
    default:
      throw new Error('Unsupported provider');
  }
}
