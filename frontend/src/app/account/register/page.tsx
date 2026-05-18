'use client';

import { AuthPanel } from '@/components/auth/AuthPanel';
import { AuthOAuthShell } from '@/components/auth/AuthOAuthShell';

export default function RegisterPage() {
  return (
    <AuthOAuthShell>
      <AuthPanel defaultTab="register" />
    </AuthOAuthShell>
  );
}
