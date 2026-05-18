'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getAccessToken, isAdminRole, setSession } from '@/lib/authSession';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function redirectIfAlreadyAdmin() {
      if (!getAccessToken()) {
        if (!cancelled) setCheckingSession(false);
        return;
      }
      try {
        const profile = await api.get('/auth/me');
        if (!cancelled && isAdminRole(profile.role)) {
          window.location.href = '/admin';
          return;
        }
      } catch {
        // show login form — do not clear tokens (user may still use the store)
      }
      if (!cancelled) setCheckingSession(false);
    }

    redirectIfAlreadyAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.post(
        '/auth/login',
        {
          email: email.trim(),
          password,
        },
        { skipAuth: true }
      );

      if (result.user.role !== 'ADMIN' && result.user.role !== 'STAFF') {
        setError('Access denied. Admin or Staff role required.');
        setLoading(false);
        return;
      }

      setSession(result.accessToken, result.refreshToken, result.user.role);
      // Full page load so admin shell starts with a clean session
      window.location.href = '/admin';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(
        message.includes('fetch') || message.includes('Failed to fetch')
          ? 'Cannot reach the API. Ensure Docker is running (http://localhost:3002).'
          : message
      );
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400 text-sm">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8 pb-safe">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center font-bold text-2xl text-white mx-auto mb-4">
            AGT
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Sign in with your admin credentials</p>
        </div>

        {error && <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-accent">
            ← Back to Store
          </a>
        </div>
      </div>
    </div>
  );
}
