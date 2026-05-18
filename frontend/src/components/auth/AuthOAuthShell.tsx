'use client';

import { useEffect, useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { fetchOAuthConfig } from '@/lib/oauth';

export function AuthOAuthShell({ children }: { children: React.ReactNode }) {
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);

  useEffect(() => {
    fetchOAuthConfig()
      .then((cfg) => {
        if (cfg.google.clientId) setGoogleClientId(cfg.google.clientId);
      })
      .catch(() => {
        /* OAuth optional — email/password still works */
      });
  }, []);

  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
  }

  return <>{children}</>;
}
