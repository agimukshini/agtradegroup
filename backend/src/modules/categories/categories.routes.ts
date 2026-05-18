import { Router } from 'express';
import { CategoryService } from './categories.service';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
const categoryService = new CategoryService();

router.get('/', async (_req, res) => {
  try {
    const categories = await categoryService.getAll();
    res.json(categories);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await categoryService.getBySlug(req.params.slug);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    const category = await categoryService.update(req.params.id as string, req.body);
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'STAFF'), async (req, res) => {
  try {
    await categoryService.delete(req.params.id as string);
    res.json({ message: 'Category deactivated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
