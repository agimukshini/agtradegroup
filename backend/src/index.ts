import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { connectDatabase, connectRedis } from './config/database';
import { env } from './config/env';
import { validateEnv } from './config/validateEnv';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/products/products.routes';
import categoryRoutes from './modules/categories/categories.routes';
import brandRoutes from './modules/brands/brands.routes';
import cartRoutes from './modules/cart/cart.routes';
import orderRoutes from './modules/orders/orders.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Middleware — allow storefront (different port/origin) to embed /uploads images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const corsOrigins = new Set(
  [
    env.baseUrl,
    process.env.CORS_ORIGINS,
    'http://localhost:3000',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3002',
  ]
    .filter(Boolean)
    .flatMap((v) => v!.split(','))
    .map((v) => v.trim())
    .filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      // Allow local dev when API runs in Docker but browser uses localhost
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  },
});
app.use('/api/v1/', limiter);

// Optional stricter limit on registration only (login lockouts block admins during dev)
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many registration attempts. Please try again later.',
    });
  },
});
app.use('/api/v1/auth/register', registerLimiter);

const authSensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: 'Too many attempts. Please wait and try again.' });
  },
});
app.use('/api/v1/auth/login', authSensitiveLimiter);
app.use('/api/v1/auth/oauth', authSensitiveLimiter);
app.use('/api/v1/auth/forgot-password', authSensitiveLimiter);
app.use('/api/v1/auth/refresh', authSensitiveLimiter);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);

// Public promotions
app.get('/api/v1/promotions', async (_req, res) => {
  try {
    const { prisma } = await import('./config/database');
    const promotions = await prisma.promotion.findMany({
      where: { isActive: true, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
    });
    res.json(promotions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
async function start() {
  validateEnv();
  await connectDatabase();
  await connectRedis();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${env.port}`);
    console.log(`📦 Environment: ${env.nodeEnv}`);
  });
}

start();

export default app;
