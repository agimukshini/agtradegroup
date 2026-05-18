import { env } from './env';

const INSECURE_JWT_MARKERS = ['dev-secret', 'change-in-production', 'change-me'];

export function validateEnv(): void {
  const isProd = env.nodeEnv === 'production';

  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  if (isProd) {
    const secret = process.env.JWT_SECRET || '';
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    if (INSECURE_JWT_MARKERS.some((m) => secret.includes(m))) {
      throw new Error('JWT_SECRET must not use a default or placeholder value in production');
    }
  }
}
