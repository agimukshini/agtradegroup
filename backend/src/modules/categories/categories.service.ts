import { prisma, redis } from '../../config/database';
import { generateSlug } from '../../utils/helpers';

export class CategoryService {
  async getAll() {
    const cached = await redis.get('categories:tree');
    if (cached) return JSON.parse(cached);

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    const tree = categories.filter((c: any) => !c.parentId);
    await redis.setex('categories:tree', 3600, JSON.stringify(tree));
    return tree;
  }

  async getBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: { children: true, parent: true },
    });
    return category;
  }

  async create(data: { name: string; slug?: string; description?: string; image?: string; parentId?: string; sortOrder?: number }) {
    const category = await prisma.category.create({
      data: { ...data, slug: data.slug || generateSlug(data.name) },
    });
    await redis.del('categories:tree');
    return category;
  }

  async update(id: string, data: any) {
    if (data.name && !data.slug) data.slug = generateSlug(data.name);
    const category = await prisma.category.update({ where: { id }, data });
    await redis.del('categories:tree');
    return category;
  }

  async delete(id: string) {
    const category = await prisma.category.update({ where: { id }, data: { isActive: false } });
    await redis.del('categories:tree');
    return category;
  }
}
