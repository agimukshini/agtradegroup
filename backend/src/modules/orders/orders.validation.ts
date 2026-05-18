import { z } from 'zod';

export const createOrderSchema = z.object({
  customerEmail: z.string().email('Invalid email'),
  customerPhone: z.string().min(6, 'Phone too short'),
  customerName: z.string().min(1, 'Name is required'),
  deliveryCity: z.string().min(1, 'City is required'),
  deliveryAddress: z.string().min(1, 'Address is required'),
  deliveryZip: z.string().optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'BANK_TRANSFER']),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1, 'At least one item required'),
});
