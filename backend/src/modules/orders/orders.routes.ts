import { Router } from 'express';
import { OrderService } from './orders.service';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createOrderSchema } from './orders.validation';
import { generateInvoice } from '../../utils/invoice';
import { canAccessOrder } from '../../utils/orderAccess';
import path from 'path';
import fs from 'fs';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
const VALID_ORDER_STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const router = Router();
const orderService = new OrderService();

router.post('/', optionalAuth, validate(createOrderSchema), async (req: AuthRequest, res) => {
  try {
    const order = await orderService.createOrder({
      ...req.body,
      userId: req.user?.id,
    });
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orders = await orderService.getUserOrders(
      req.user!.id,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );
    res.json(orders);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const order = await orderService.getOrderByTracking(req.params.trackingNumber as string);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/invoice/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!canAccessOrder(order, req)) {
      return res.status(403).json({ error: 'You do not have access to this order' });
    }

    const invoicePath = path.join(process.cwd(), 'uploads', 'invoices', `invoice-${order.orderNumber}.pdf`);
    if (!fs.existsSync(invoicePath)) {
      await generateInvoice(order);
    }

    res.download(invoicePath);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id as string);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!canAccessOrder(order, req)) {
      return res.status(403).json({ error: 'You do not have access to this order' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!VALID_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await orderService.updateStatus(req.params.id as string, status);
    res.json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
