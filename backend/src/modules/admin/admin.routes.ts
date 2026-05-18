import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { paginate } from '../../utils/helpers';
import { OrderService } from '../orders/orders.service';
import { formatProduct } from '../products/products.service';

const orderService = new OrderService();

const router = Router();

// Dashboard analytics
router.get('/dashboard', authenticate, authorize('ADMIN', 'STAFF'), async (_req: AuthRequest, res) => {
  try {
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        _sum: { total: true },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.product.count({
        where: { deletedAt: null, stockQuantity: { lte: prisma.product.fields.lowStockThreshold } },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderNumber: true, customerName: true, total: true, status: true, createdAt: true,
        },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total ? Number(totalRevenue._sum.total) : 0,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      recentOrders: recentOrders.map((o) => ({
        ...o,
        total: Number(o.total),
      })),
      ordersByStatus,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Order management
router.get('/orders', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = (req.query.status as string) || undefined;
    const search = (req.query.search as string) || undefined;

    const result = await orderService.getAllAdmin({ page, limit, status, search });

    res.json({
      orders: result.orders.map((o: any) => ({
        ...o,
        subtotal: Number(o.subtotal),
        shippingFee: Number(o.shippingFee),
        discount: Number(o.discount),
        total: Number(o.total),
      })),
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Customer management
router.get('/customers', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    res.json({ customers, pagination: paginate(total, page, limit) });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/customers/:id/role', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    if (!['ADMIN', 'STAFF', 'CUSTOMER'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { role },
      select: { id: true, email: true, role: true },
    });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Product management (admin list)
router.get('/products', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          brand: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map((p) => formatProduct(p)),
      pagination: paginate(total, page, limit),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/products/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id as string, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(formatProduct(product));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Inventory management
router.get('/inventory', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true, price: true },
        orderBy: { stockQuantity: 'asc' },
      }),
      prisma.product.count({ where: { deletedAt: null } }),
    ]);

    res.json({ products, pagination: paginate(total, page, limit) });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/inventory/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const { stockQuantity, reason, note } = req.body;
    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const change = stockQuantity - product.stockQuantity;

    await prisma.$transaction([
      prisma.product.update({ where: { id: req.params.id as string }, data: { stockQuantity } }),
      prisma.inventoryLog.create({
        data: {
          productId: req.params.id as string,
          change,
          reason: reason || 'adjustment',
          note: note || `Manual stock adjustment from ${product.stockQuantity} to ${stockQuantity}`,
        },
      }),
    ]);

    res.json({ message: 'Inventory updated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/inventory/low-stock', authenticate, authorize('ADMIN', 'STAFF'), async (_req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        stockQuantity: { lte: prisma.product.fields.lowStockThreshold },
      },
      select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true },
      orderBy: { stockQuantity: 'asc' },
    });
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Promotions
router.get('/promotions', authenticate, authorize('ADMIN', 'STAFF'), async (_req: AuthRequest, res) => {
  try {
    const promotions = await prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(promotions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/promotions', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const promotion = await prisma.promotion.create({ data: req.body });
    res.status(201).json(promotion);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/promotions/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    const promotion = await prisma.promotion.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(promotion);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/promotions/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Promotion deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
