import { Router } from 'express';
import { prisma } from '../../config/database';
import { authenticate, AuthRequest, optionalAuth } from '../../middleware/auth';
import { findCartItemForCaller, getSessionId } from '../../utils/cartAccess';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    const where = userId ? { userId } : { sessionId };
    const items = await prisma.cartItem.findMany({
      where,
      include: {
        product: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    const enriched = items.map((item: any) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
        discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
        vatRate: item.product.vatRate != null ? Number(item.product.vatRate) : null,
      },
    }));

    res.json({ items: enriched });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/items', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'productId and quantity (min 1) are required' });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null, status: 'ACTIVE' },
      select: { stockQuantity: true, name: true },
    });

    if (!product) {
      return res.status(400).json({ error: 'Product not available' });
    }

    const existing = await prisma.cartItem.findFirst({
      where: userId ? { userId, productId } : { sessionId, productId },
    });

    const newQty = (existing?.quantity ?? 0) + quantity;
    if (product.stockQuantity < newQty) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.name}" (max ${product.stockQuantity})`,
      });
    }

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: true },
      });
      return res.json(updated);
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        productId,
        quantity,
      },
      include: { product: true },
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/items/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const owned = await findCartItemForCaller(req.params.id as string, req);
    if (!owned) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const product = await prisma.product.findFirst({
      where: { id: owned.productId, deletedAt: null, status: 'ACTIVE' },
      select: { stockQuantity: true, name: true },
    });

    if (!product) {
      return res.status(400).json({ error: 'Product not available' });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        error: `Insufficient stock for "${product.name}" (max ${product.stockQuantity})`,
      });
    }

    const item = await prisma.cartItem.update({
      where: { id: owned.id },
      data: { quantity },
      include: { product: true },
    });

    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/items/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const owned = await findCartItemForCaller(req.params.id as string, req);
    if (!owned) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: owned.id } });
    res.json({ message: 'Item removed' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = getSessionId(req);

    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } });
    } else {
      await prisma.cartItem.deleteMany({ where: { sessionId } });
    }

    res.json({ message: 'Cart cleared' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
