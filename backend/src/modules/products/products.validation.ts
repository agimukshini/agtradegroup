import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  price: z.string().refine(v => parseFloat(v) > 0, 'Price must be positive'),
  discountPrice: z.string().optional(),
  stockQuantity: z.string().refine(v => parseInt(v) >= 0, 'Stock must be non-negative'),
  lowStockThreshold: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid('Invalid brand ID').optional().or(z.literal('')),
  isFeatured: z.string().optional(),
  specs: z.string().optional(),
  vatRate: z
    .string()
    .optional()
    .refine((v) => !v || v === '' || ['0', '8', '18'].includes(v), {
      message: 'VAT rate must be 0, 8, 18, or empty',
    }),
});

export const updateProductSchema = createProductSchema.partial();
