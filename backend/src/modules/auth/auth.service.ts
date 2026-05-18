import { prisma } from '../../config/database';
import { env } from '../../config/env';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { OAuthProvider } from '@prisma/client';
import { sendPasswordReset } from '../../utils/email';
import {
  OAuthProfile,
  OAuthProviderName,
  verifyOAuthCredential,
} from './oauth.verify';

const oauthProviderMap: Record<OAuthProviderName, OAuthProvider> = {
  google: OAuthProvider.GOOGLE,
  facebook: OAuthProvider.FACEBOOK,
  apple: OAuthProvider.APPLE,
};

export class AuthService {
  async register(data: {
    email: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, ...(data.phone ? [{ phone: data.phone }] : [])] },
    });

    if (existing) {
      throw new Error('Email or phone already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true, role: true, createdAt: true,
      },
    });

    return this.buildAuthResponse(user);
  }

  async loginWithOAuth(
    provider: OAuthProviderName,
    credential: string,
    name?: { firstName?: string; lastName?: string }
  ) {
    const profile = await verifyOAuthCredential(provider, credential, name);
    return this.loginWithOAuthProfile(profile);
  }

  async loginWithOAuthProfile(profile: OAuthProfile) {
    const providerEnum = oauthProviderMap[profile.provider];

    const linked = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerId: {
          provider: providerEnum,
          providerId: profile.providerId,
        },
      },
      include: { user: true },
    });

    if (linked) {
      if (!linked.user.isActive || linked.user.deletedAt) {
        throw new Error('Account is deactivated');
      }
      return this.buildAuthResponse(linked.user);
    }

    let user = await prisma.user.findFirst({
      where: { email: profile.email, deletedAt: null },
    });

    if (user) {
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }
      await prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: providerEnum,
          providerId: profile.providerId,
        },
      });
      if (profile.avatarUrl && !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: profile.avatarUrl },
        });
      }
      return this.buildAuthResponse(user);
    }

    user = await prisma.user.create({
      data: {
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: profile.avatarUrl,
        password: null,
        oauthAccounts: {
          create: {
            provider: providerEnum,
            providerId: profile.providerId,
          },
        },
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone: email }],
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    if (!user.password) {
      throw new Error('This account uses Google, Facebook, or Apple sign-in');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refreshToken(token: string) {
    const stored = await prisma.refreshToken.findFirst({
      where: { token, revoked: false, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!stored) {
      throw new Error('Invalid or expired refresh token');
    }

    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

    const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(stored.userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if email exists

    const resetToken = jwt.sign({ userId: user.id }, env.jwtSecret, { expiresIn: '1h' });

    await prisma.refreshToken.create({
      data: {
        token: `reset_${resetToken}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000),
      },
    });

    await sendPasswordReset(email, resetToken);
  }

  async resetPassword(token: string, password: string) {
    const decoded = jwt.verify(token, env.jwtSecret) as { userId: string };

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: decoded.userId },
      data: { revoked: true },
    });
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    const { accessToken, refreshToken } = await this.generateTokens(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  private async generateTokens(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    });

    if (!user) throw new Error('User not found');

    const accessToken = jwt.sign(
      { id: userId, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as any },
    );

    const refreshToken = uuidv4();

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
