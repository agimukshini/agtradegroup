'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, ArrowRight, Shield, Headphones } from 'lucide-react';
import { api } from '@/lib/api';
import { setSession } from '@/lib/authSession';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

type Tab = 'login' | 'register';

export function AuthPanel({ defaultTab = 'login' }: { defaultTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '', remember: false });
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    contractor: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.post('/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
      });
      setSession(result.accessToken, result.refreshToken, result.user.role);
      if (result.user.role === 'ADMIN' || result.user.role === 'STAFF') {
        window.location.href = '/admin';
      } else {
        router.push('/account');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (registerForm.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const { firstName, lastName, email, phone, password } = registerForm;
      const result = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        password,
      });
      setSession(result.accessToken, result.refreshToken, result.user?.role);
      router.push('/account');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-brand-navy/5 -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-[480px]">
        <div className="bg-white rounded-2xl auth-card overflow-hidden">
          <div className="px-8 pt-8 pb-4 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-brand-navy mb-6 text-center">
              {tab === 'login' ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <div className="flex border-b border-gray-200 relative">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`auth-tab flex-1 pb-3 text-center text-sm font-medium transition-colors ${
                  tab === 'login' ? 'active text-brand-navy' : 'text-brand-muted hover:text-brand-navy'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('register')}
                className={`auth-tab flex-1 pb-3 text-center text-sm font-medium transition-colors ${
                  tab === 'register' ? 'active text-brand-navy' : 'text-brand-muted hover:text-brand-navy'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-danger/10 text-danger p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <SocialLoginButtons
              disabled={loading}
              onError={setError}
              onLoadingChange={setLoading}
            />

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-navy mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      placeholder="contractor@example.com"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy bg-gray-50 focus:bg-white h-12"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-brand-navy mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy focus:border-brand-navy bg-gray-50 focus:bg-white h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm text-brand-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={loginForm.remember}
                      onChange={(e) => setLoginForm({ ...loginForm, remember: e.target.checked })}
                      className="custom-checkbox auth-check"
                    />
                    Remember me
                  </label>
                  <Link href="/contact" className="text-sm font-medium text-brand-navy hover:text-brand-orange">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-3.5 px-4 rounded-lg shadow-sm transition-colors mt-6 h-12 flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-brand-muted mb-4">Quick checkout for new customers</p>
                  <Link
                    href="/checkout"
                    className="inline-flex justify-center items-center w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-brand-navy bg-white hover:bg-gray-50 transition-colors h-12"
                  >
                    Continue as Guest
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">First Name</label>
                    <input
                      type="text"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                      required
                      placeholder="John"
                      className="block w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy bg-gray-50 focus:bg-white h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-navy mb-1.5">Last Name</label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      required
                      placeholder="Doe"
                      className="block w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy bg-gray-50 focus:bg-white h-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    placeholder="john@company.com"
                    className="block w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy bg-gray-50 focus:bg-white h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-1.5">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="+383 4X XXX XXX"
                    className="block w-full px-3.5 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy bg-gray-50 focus:bg-white h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-navy mb-1.5">Create Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      placeholder="Min. 8 characters"
                      className="block w-full px-3.5 pr-10 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-navy bg-gray-50 focus:bg-white h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-brand-muted mt-1.5">Must be at least 8 characters.</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="contractor"
                    checked={registerForm.contractor}
                    onChange={(e) => setRegisterForm({ ...registerForm, contractor: e.target.checked })}
                    className="custom-checkbox auth-check mt-0.5"
                  />
                  <div>
                    <label htmlFor="contractor" className="text-sm font-medium text-brand-navy cursor-pointer">
                      I am a professional contractor
                    </label>
                    <p className="text-xs text-brand-muted mt-0.5">Register for B2B pricing and faster checkout.</p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white font-semibold py-3.5 px-4 rounded-lg shadow-sm transition-colors mt-6 h-12 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-xs text-center text-brand-muted mt-4">
                  By creating an account, you agree to our{' '}
                  <Link href="/contact" className="text-brand-navy underline hover:text-brand-orange">
                    Terms of Service
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-brand-muted text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-navy" />
            Secure Login
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-brand-navy" />
            24/7 Support
          </div>
        </div>
      </div>
    </div>
  );
}
