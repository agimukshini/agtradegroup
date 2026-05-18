'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import {
  applyAuthResult,
  fetchOAuthConfig,
  signInWithOAuth,
  type OAuthConfig,
  type OAuthProviderName,
} from '@/lib/oauth';

type SocialLoginButtonsProps = {
  disabled?: boolean;
  onError: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
};

function loadScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${id}`));
    document.body.appendChild(script);
  });
}

export function SocialLoginButtons({
  disabled,
  onError,
  onLoadingChange,
}: SocialLoginButtonsProps) {
  const router = useRouter();
  const [config, setConfig] = useState<OAuthConfig | null>(null);
  const [fbReady, setFbReady] = useState(false);
  const [appleReady, setAppleReady] = useState(false);

  useEffect(() => {
    fetchOAuthConfig()
      .then(setConfig)
      .catch(() => setConfig(null));
  }, []);

  useEffect(() => {
    if (!config?.facebook.enabled || !config.facebook.appId) return;

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: config.facebook.appId!,
        cookie: true,
        xfbml: false,
        version: 'v21.0',
      });
      setFbReady(true);
    };

    loadScript('facebook-jssdk', 'https://connect.facebook.net/en_US/sdk.js').catch(() => {
      onError('Facebook sign-in could not be loaded');
    });
  }, [config?.facebook.enabled, config?.facebook.appId, onError]);

  useEffect(() => {
    if (!config?.apple.enabled || !config.apple.clientId || !config.apple.redirectUri) return;

    loadScript(
      'apple-auth',
      'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
    )
      .then(() => {
        window.AppleID?.auth.init({
          clientId: config.apple.clientId!,
          scope: 'name email',
          redirectURI: config.apple.redirectUri!,
          usePopup: true,
        });
        setAppleReady(true);
      })
      .catch(() => {
        onError('Apple sign-in could not be loaded');
      });
  }, [
    config?.apple.enabled,
    config?.apple.clientId,
    config?.apple.redirectUri,
    onError,
  ]);

  const runOAuth = useCallback(
    async (
      provider: OAuthProviderName,
      credential: string,
      name?: { firstName?: string; lastName?: string }
    ) => {
      onError('');
      onLoadingChange?.(true);
      try {
        const result = await signInWithOAuth(provider, credential, name);
        applyAuthResult(result, router);
      } catch (err: unknown) {
        onError(err instanceof Error ? err.message : 'Sign-in failed');
      } finally {
        onLoadingChange?.(false);
      }
    },
    [onError, onLoadingChange, router]
  );

  const signInFacebook = () => {
    if (!fbReady || !window.FB) {
      onError('Facebook sign-in is not ready yet');
      return;
    }
    window.FB.login(
      (response) => {
        const token = response.authResponse?.accessToken;
        if (token) {
          void runOAuth('facebook', token);
        } else if (response.status !== 'unknown') {
          onError('Facebook sign-in was cancelled');
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  const signInApple = async () => {
    if (!appleReady || !window.AppleID) {
      onError('Apple sign-in is not ready yet');
      return;
    }
    try {
      const response = await window.AppleID.auth.signIn();
      const token = response.authorization?.id_token;
      if (!token) {
        onError('Apple sign-in did not return a token');
        return;
      }
      const firstName = response.user?.name?.firstName;
      const lastName = response.user?.name?.lastName;
      await runOAuth(
        'apple',
        token,
        firstName || lastName ? { firstName, lastName } : undefined
      );
    } catch {
      onError('Apple sign-in was cancelled or failed');
    }
  };

  if (!config) return null;

  const anyEnabled =
    config.google.enabled || config.facebook.enabled || config.apple.enabled;
  if (!anyEnabled) return null;

  const btnClass =
    'w-full h-12 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-brand-navy flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="space-y-3">
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <p className="relative flex justify-center text-xs uppercase tracking-wide text-brand-muted bg-white px-3 mx-auto w-fit">
          Or continue with
        </p>
      </div>

      {config.google.enabled && config.google.clientId && (
        <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) void runOAuth('google', res.credential);
              else onError('Google sign-in did not return a credential');
            }}
            onError={() => onError('Google sign-in failed')}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            width={400}
          />
        </div>
      )}

      {config.facebook.enabled && (
        <button
          type="button"
          disabled={disabled || !fbReady}
          onClick={signInFacebook}
          className={btnClass}
        >
          <FacebookIcon />
          Continue with Facebook
        </button>
      )}

      {config.apple.enabled && (
        <button
          type="button"
          disabled={disabled || !appleReady}
          onClick={() => void signInApple()}
          className={`${btnClass} bg-black text-white border-black hover:bg-gray-900`}
        >
          <AppleIcon />
          Continue with Apple
        </button>
      )}
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05 1.88-3.3 1.9-1.24.02-1.64-.74-3.06-.74-1.41 0-1.85.72-3.02.76-1.22.04-2.14-1.24-3.12-2.19C2.79 17.25 1.38 12.45 3.37 9.29c.99-1.58 2.74-2.58 4.66-2.61 1.16-.02 2.25.78 3.06.78.8 0 2.3-.96 3.88-.82.66.03 2.52.27 3.71 2.05-.09.06-2.22 1.29-2.2 3.84.03 3.05 2.67 4.06 2.7 4.08-.02.06-.42 1.44-1.38 2.85zM12.03 7.25c.15-2.23 1.66-3.74 3.08-3.87.18 2.01-1.83 3.74-3.08 3.87z" />
    </svg>
  );
}

declare global {
  interface Window {
    FB?: {
      init: (opts: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          status?: string;
          authResponse?: { accessToken?: string };
        }) => void,
        options: { scope: string }
      ) => void;
    };
    fbAsyncInit?: () => void;
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: { id_token: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
      };
    };
  }
}
