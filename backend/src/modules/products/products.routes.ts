import { Router } from 'express';
import { ProductService } from './products.service';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { importUpload } from '../../middleware/uploadImport';
import { createProductSchema, updateProductSchema } from './products.validation';
import { ProductImportService } from './products.import.service';

const router = Router();
const productService = new ProductService();
const importService = new ProductImportService();

// Public routes
router.get('/', async (req, res) => {
  try {
    const result = await productService.getAll({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      search: req.query.search as string,
      category: req.query.category as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      inStock: req.query.inStock === 'true',
      featured: req.query.featured === 'true',
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
    });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const products = await productService.getFeatured(parseInt(req.query.limit as string) || 8);
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await productService.getBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/slug/:slug/related', async (req, res) => {
  try {
    const products = await productService.getRelated(req.params.slug, parseInt(req.query.limit as string) || 4);
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/low-stock', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const products = await productService.getLowStock();
    res.json(products);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/import/template', authenticate, authorize('ADMIN', 'STAFF'), async (_req, res) => {
  try {
    const csv = await importService.buildTemplateCsv();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="product-import-template.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post(
  '/import',
  authenticate,
  authorize('ADMIN', 'STAFF'),
  importUpload.fields([
    { name: 'csv', maxCount: 1 },
    { name: 'imagesZip', maxCount: 1 },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const files = req.files as { csv?: Express.Multer.File[]; imagesZip?: Express.Multer.File[] };
      const csvFile = files.csv?.[0];
      if (!csvFile) {
        return res.status(400).json({ error: 'CSV file is required (field name: csv)' });
      }
      if (csvFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({ error: 'CSV file must be under 5MB' });
      }

      const updateExisting = req.query.updateExisting === 'true';

      const result = await importService.runImport({
        csvBuffer: csvFile.buffer,
        zipBuffer: files.imagesZip?.[0]?.buffer,
        updateExisting,
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Admin routes
router.get('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const product = await productService.getById(req.params.id as string);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), upload.array('images', 10), async (req: AuthRequest, res) => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0]?.message || 'Validation failed' });
    }
    const files = (req.files as Express.Multer.File[]) || [];
    const images = files.map((f) => ({ url: `/uploads/${f.filename}`, alt: req.body.name }));
    const product = await productService.create({ ...req.body, images });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), upload.array('images', 10), async (req: AuthRequest, res) => {
  try {
    const files = (req.files as Express.Multer.File[]) || [];
    const newImages = files.map((f) => ({ url: `/uploads/${f.filename}`, alt: req.body.name }));
    const product = await productService.update(req.params.id as string, {
      ...req.body,
      ...(newImages.length ? { newImages } : {}),
    });
    res.json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id/images/:imageId', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    const result = await productService.deleteImage(req.params.id as string, req.params.imageId as string);
    if (!result) return res.status(404).json({ error: 'Image not found' });
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req: AuthRequest, res) => {
  try {
    await productService.delete(req.params.id as string);
    res.json({ message: 'Product deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
