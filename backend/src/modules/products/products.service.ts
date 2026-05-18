import { ProductStatus } from '@prisma/client';
import { prisma, redis } from '../../config/database';
import { generateSlug, paginate } from '../../utils/helpers';
import { formatProductVatRate, parseVatRateInput } from '../../utils/vat';

function parseStatus(value: unknown): ProductStatus {
  const s = String(value || 'ACTIVE').toUpperCase();
  if (s === 'DRAFT' || s === 'ARCHIVED') return s;
  return 'ACTIVE';
}

function parseBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

export function formatProduct<T extends Record<string, unknown>>(p: T) {
  return {
    ...p,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    vatRate: formatProductVatRate(p.vatRate),
    weight: p.weight ? Number(p.weight) : null,
  };
}

function pickProductFields(data: Record<string, unknown>) {
  const brandId = data.brandId as string | undefined;
  return {
    name: data.name as string,
    description: (data.description as string) || null,
    shortDescription: (data.shortDescription as string) || null,
    sku: data.sku as string,
    barcode: (data.barcode as string) || null,
    categoryId: data.categoryId as string,
    brandId: brandId && brandId.length > 0 ? brandId : null,
    status: parseStatus(data.status),
    price: parseFloat(String(data.price)),
    discountPrice:
      data.discountPrice && String(data.discountPrice).length > 0
        ? parseFloat(String(data.discountPrice))
        : null,
    vatRate: 'vatRate' in data ? parseVatRateInput(data.vatRate) : undefined,
    stockQuantity: parseInt(String(data.stockQuantity ?? 0), 10) || 0,
    lowStockThreshold: parseInt(String(data.lowStockThreshold ?? 10), 10) || 10,
    isFeatured: parseBool(data.isFeatured),
    sortOrder: data.sortOrder != null ? parseInt(String(data.sortOrder), 10) : undefined,
    weight:
      data.weight && String(data.weight).length > 0 ? parseFloat(String(data.weight)) : null,
    specs: data.specs
      ? typeof data.specs === 'string'
        ? JSON.parse(data.specs as string)
        : data.specs
      : undefined,
  };
}

async function clearProductCache() {
  const keys = await redis.keys('products:*');
  if (keys.length > 0) await redis.del(...keys);
}

export class ProductService {
  async getById(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!product) return null;
    return formatProduct(product);
  }
  async getAll(filters: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { page, limit, search, category, brand, minPrice, maxPrice, inStock, featured } = filters;
    const skip = (page - 1) * limit;

    const where: any = { status: 'ACTIVE', deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ slug: category }, { id: category }], isActive: true },
      });
      if (cat) where.categoryId = cat.id;
    }
    if (brand) {
      const br = await prisma.brand.findFirst({
        where: { OR: [{ slug: brand }, { id: brand }], isActive: true },
      });
      if (br) where.brandId = br.id;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    if (inStock) where.stockQuantity = { gt: 0 };
    if (featured) where.isFeatured = true;

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const result = {
      products: products.map((p: any) => formatProduct(p)),
      pagination: paginate(total, page, limit),
    };

    await redis.setex(cacheKey, 300, JSON.stringify(result)); // Cache 5 min
    return result;
  }

  async getFeatured(limit: number) {
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true, deletedAt: null },
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return products.map((p: any) => formatProduct(p));
  }

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    });

    if (!product) return null;

    return formatProduct(product);
  }

  async getRelated(slug: string, limit: number) {
    const product = await this.getBySlug(slug);
    if (!product) return [];

    const related = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        categoryId: product.categoryId,
        slug: { not: slug },
      },
      take: limit,
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });

    return related.map((p: any) => formatProduct(p));
  }

  async create(data: Record<string, unknown> & { images?: { url: string; alt?: string }[] }) {
    const { images, ...raw } = data;
    const fields = pickProductFields(raw);
    const slug = generateSlug(fields.name);

    const product = await prisma.product.create({
      data: {
        ...fields,
        slug,
        images: images?.length
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                alt: img.alt || fields.name,
                sortOrder: i,
                isPrimary: i === 0,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true, brand: true },
    });

    await clearProductCache();
    return formatProduct(product);
  }

  async update(
    id: string,
    data: Record<string, unknown> & { newImages?: { url: string; alt?: string }[] }
  ) {
    const { newImages, ...raw } = data;
    const fields = pickProductFields(raw);
    const slug = generateSlug(fields.name);

    const product = await prisma.product.update({
      where: { id },
      data: { ...fields, slug },
    });

    if (newImages?.length) {
      const existingCount = await prisma.productImage.count({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: newImages.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: img.alt || product.name,
          sortOrder: existingCount + i,
          isPrimary: existingCount === 0 && i === 0,
        })),
      });
    }

    await clearProductCache();
    const updated = await this.getById(id);
    return updated;
  }

  async delete(id: string) {
    const product = await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'ARCHIVED' },
    });
    await clearProductCache();
    return product;
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) return null;

    await prisma.productImage.delete({ where: { id: imageId } });

    const remaining = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    if (remaining.length > 0 && !remaining.some((i) => i.isPrimary)) {
      await prisma.productImage.update({
        where: { id: remaining[0].id },
        data: { isPrimary: true },
      });
    }

    await clearProductCache();
    return { message: 'Image removed' };
  }

  async getLowStock() {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        stockQuantity: { lte: prisma.product.fields.lowStockThreshold },
      },
      select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true },
      orderBy: { stockQuantity: 'asc' },
    });
    return products;
  }
}
