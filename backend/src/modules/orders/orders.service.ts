import { prisma, redis } from '../../config/database';
import { generateOrderNumber, generateTrackingNumber, paginate } from '../../utils/helpers';
import { calculateShippingFee } from '../../utils/shipping';
import { calculateLineVat, formatProductVatRate, roundMoney } from '../../utils/vat';

function formatOrder(order: any) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    vatAmount: Number(order.vatAmount ?? 0),
    shippingFee: Number(order.shippingFee),
    discount: Number(order.discount ?? 0),
    total: Number(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      price: Number(item.price),
      total: Number(item.total),
      vatRate: item.vatRate != null ? Number(item.vatRate) : null,
    })),
  };
}
import { generateInvoice } from '../../utils/invoice';
import { sendOrderConfirmation } from '../../utils/email';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
type PaymentMethod = 'CASH_ON_DELIVERY' | 'BANK_TRANSFER' | 'CARD';

export class OrderService {
  async createOrder(data: {
    userId?: string;
    customerEmail: string;
    customerPhone: string;
    customerName: string;
    deliveryCity: string;
    deliveryAddress: string;
    deliveryZip?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
    items: { productId: string; quantity: number }[];
  }) {
    return prisma.$transaction(async (tx: any) => {
      // Validate and gather products
      const productIds = data.items.map((i: any) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, deletedAt: null, status: 'ACTIVE' },
      });

      if (products.length !== productIds.length) {
        throw new Error('One or more products are not available');
      }

      if (!data.items.length) {
        throw new Error('Order must contain at least one item');
      }

      for (const item of data.items) {
        if (!item.quantity || item.quantity < 1 || item.quantity > 999) {
          throw new Error('Each item must have a quantity between 1 and 999');
        }
      }

      // Check stock and availability
      for (const item of data.items) {
        const product = products.find((p: any) => p.id === item.productId);
        if (!product) {
          throw new Error('One or more products are not available');
        }
        if ((product as any).status !== 'ACTIVE') {
          throw new Error(`Product is not available for sale: ${product.name}`);
        }
        if ((product as any).stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}" (requested ${item.quantity}, available ${product.stockQuantity})`
          );
        }
      }

      // Calculate totals (prices excl. VAT; TVSH per product rate)
      let subtotal = 0;
      let vatAmount = 0;
      const orderItems = data.items.map((item: any) => {
        const product = products.find((p: any) => p.id === item.productId)!;
        const price = Number(product.discountPrice || product.price);
        const lineNet = roundMoney(price * item.quantity);
        const rate = formatProductVatRate(product.vatRate);
        const lineVat = calculateLineVat(lineNet, rate);
        subtotal += lineNet;
        vatAmount += lineVat;
        return {
          productId: item.productId,
          quantity: item.quantity,
          price,
          vatRate: rate,
          total: lineNet,
        };
      });

      subtotal = roundMoney(subtotal);
      vatAmount = roundMoney(vatAmount);
      const shippingFee = calculateShippingFee(data.deliveryCity);
      const total = roundMoney(subtotal + vatAmount + shippingFee);

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          trackingNumber: generateTrackingNumber(),
          status: 'PENDING',
          subtotal,
          vatAmount,
          shippingFee,
          discount: 0,
          total,
          paymentMethod: data.paymentMethod,
          paymentStatus: 'PENDING',
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerName: data.customerName,
          notes: data.notes,
          deliveryCity: data.deliveryCity,
          deliveryAddress: data.deliveryAddress,
          deliveryZip: data.deliveryZip,
          userId: data.userId || null,
          items: {
            create: orderItems,
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Update stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: 'sale',
            note: `Order ${order.orderNumber}`,
          },
        });
      }

      // Clear cart if user
      if (data.userId) {
        await tx.cartItem.deleteMany({ where: { userId: data.userId } });
      }

      // Generate invoice
      generateInvoice(order).catch(console.error);

      // Send confirmation email
      sendOrderConfirmation(order).catch(console.error);

      return order;
    });
  }

  async getUserOrders(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { product: { select: { name: true, slug: true } } } } },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders: orders.map((o: any) => formatOrder(o)),
      pagination: paginate(total, page, limit),
    };
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) return null;
    return formatOrder(order);
  }

  async getOrderByTracking(trackingNumber: string) {
    const order = await prisma.order.findUnique({
      where: { trackingNumber },
      include: { items: { include: { product: { select: { name: true } } } } },
    });
    if (!order) return null;
    return formatOrder(order);
  }

  async updateStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } },
    });
    return order;
  }

  async getAllAdmin(filters: { page: number; limit: number; status?: string; search?: string }) {
    const { page, limit, status, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: { select: { quantity: true, total: true } } },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: paginate(total, page, limit),
    };
  }
}
