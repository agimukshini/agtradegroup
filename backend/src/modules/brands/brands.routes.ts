import { Router } from 'express';
import { prisma, redis } from '../../config/database';
import { generateSlug } from '../../utils/helpers';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const cached = await redis.get('brands:all');
    if (cached) return res.json(JSON.parse(cached));

    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    await redis.setex('brands:all', 3600, JSON.stringify(brands));
    res.json(brands);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/** All brands for admin (includes inactive) */
router.get('/all', authenticate, authorize('ADMIN', 'STAFF'), async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(brands);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const brand = await prisma.brand.create({
      data: { ...req.body, slug: req.body.slug || generateSlug(req.body.name) },
    });
    await redis.del('brands:all');
    res.status(201).json(brand);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const { name, slug, description, logo, isActive } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (logo !== undefined) data.logo = logo || null;
    if (isActive !== undefined) data.isActive = isActive === true || isActive === 'true';
    if (slug !== undefined) data.slug = slug;
    else if (name) data.slug = generateSlug(name);

    const brand = await prisma.brand.update({ where: { id: req.params.id as string }, data });
    await redis.del('brands:all');
    res.json(brand);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      await prisma.brand.update({ where: { id }, data: { isActive: false } });
      await redis.del('brands:all');
      return res.json({ message: 'Brand deactivated (products still linked)' });
    }
    await prisma.brand.delete({ where: { id } });
    await redis.del('brands:all');
    res.json({ message: 'Brand deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
