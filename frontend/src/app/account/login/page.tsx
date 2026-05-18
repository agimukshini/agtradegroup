'use client';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { AuthOAuthShell } from '@/components/auth/AuthOAuthShell';

export default function LoginPage() {
  return (
    <AuthOAuthShell>
      <AuthPanel defaultTab="login" />
    </AuthOAuthShell>
  );
}
