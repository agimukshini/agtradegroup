import { Router } from 'express';
import { AuthService } from './auth.service';
import { validate } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  oauthSchema,
} from './auth.validation';
import { env } from '../../config/env';
import { authenticate, AuthRequest } from '../../middleware/auth';

const router = Router();
const authService = new AuthService();

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/oauth/config', (_req, res) => {
  res.json({
    google: {
      enabled: Boolean(env.googleClientId),
      clientId: env.googleClientId || null,
    },
    facebook: {
      enabled: Boolean(env.facebookAppId),
      appId: env.facebookAppId || null,
    },
    apple: {
      enabled: Boolean(env.appleClientId),
      clientId: env.appleClientId || null,
      redirectUri: env.appleRedirectUri || null,
    },
  });
});

router.post('/oauth', validate(oauthSchema), async (req, res) => {
  try {
    const { provider, credential, firstName, lastName } = req.body;
    const result = await authService.loginWithOAuth(provider, credential, {
      firstName,
      lastName,
    });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const user = await (await import('../../config/database')).prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
