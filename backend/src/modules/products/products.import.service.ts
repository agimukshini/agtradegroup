import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { parseCsv, toCsv } from '../../utils/csv';
import { isAllowedKosovoVatRate } from '../../constants/kosovoVat';
import { ProductService } from './products.service';

export type ImportRowResult = {
  line: number;
  sku: string;
  name: string;
  status: 'created' | 'updated' | 'skipped' | 'error';
  message?: string;
};

export type ImportResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  rows: ImportRowResult[];
};

/** Read first non-empty value from row using several possible column names. */
function col(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k]?.trim();
    if (v) return v;
  }
  return '';
}

async function saveImageFromZip(
  zipIndex: Map<string, { buffer: Buffer; ext: string }>,
  filename: string
): Promise<string | null> {
  const entry = zipIndex.get(path.basename(filename).toLowerCase());
  if (!entry) return null;

  const uploadDir = env.uploadDir;
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const name = `${uuidv4()}${entry.ext}`;
  fs.writeFileSync(path.join(uploadDir, name), entry.buffer);
  return `/uploads/${name}`;
}

function buildZipIndex(zipBuffer?: Buffer): Map<string, { buffer: Buffer; ext: string }> {
  const map = new Map<string, { buffer: Buffer; ext: string }>();
  if (!zipBuffer?.length) return map;

  for (const entry of new AdmZip(zipBuffer).getEntries()) {
    if (entry.isDirectory) continue;
    const base = path.basename(entry.entryName);
    const ext = path.extname(base).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) continue;
    map.set(base.toLowerCase(), {
      buffer: entry.getData(),
      ext: ext === '.jpeg' ? '.jpg' : ext,
    });
  }
  return map;
}

export class ProductImportService {
  private productService = new ProductService();

  async buildTemplateCsv(): Promise<string> {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { name: 'asc' },
    });

    const headers = ['sku', 'name', 'category', 'brand', 'price', 'stock', 'sale_price', 'vat', 'image'];
    const example = [
      'MY-SKU-001',
      'Product name',
      categories[0]?.slug ?? 'plumbing',
      '',
      '19.99',
      '10',
      '',
      '18',
      'MY-SKU-001.jpg',
    ];

    const note = `# category = slug from Admin → Categories. brand = optional slug. vat = 18, 8, 0 or empty. image = filename inside ZIP.`;
    return `${note}\r\n${toCsv(headers, [example])}`;
  }

  async runImport(options: {
    csvBuffer: Buffer;
    zipBuffer?: Buffer;
    updateExisting: boolean;
  }): Promise<ImportResult> {
    const records = parseCsv(options.csvBuffer.toString('utf8'));
    const zipIndex = buildZipIndex(options.zipBuffer);

    const [categories, brands, existingProducts] = await Promise.all([
      prisma.category.findMany({ select: { id: true, slug: true } }),
      prisma.brand.findMany({ select: { id: true, slug: true } }),
      prisma.product.findMany({ where: { deletedAt: null }, select: { id: true, sku: true } }),
    ]);

    const categoryBySlug = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));
    const brandBySlug = new Map(brands.map((b) => [b.slug.toLowerCase(), b.id]));
    const productBySku = new Map(existingProducts.map((p) => [p.sku.toLowerCase(), p.id]));

    const result: ImportResult = {
      total: records.length,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      rows: [],
    };

    const push = (row: ImportRowResult) => {
      result.rows.push(row);
      if (row.status === 'created') result.created++;
      else if (row.status === 'updated') result.updated++;
      else if (row.status === 'skipped') result.skipped++;
      else result.failed++;
    };

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const line = i + 2;
      const sku = col(row, 'sku');
      const name = col(row, 'name');

      if (!sku || !name) {
        push({ line, sku: sku || '—', name: name || '—', status: 'error', message: 'sku and name required' });
        continue;
      }

      const categorySlug = col(row, 'category', 'category_slug').toLowerCase();
      const categoryId = categoryBySlug.get(categorySlug);
      if (!categoryId) {
        push({ line, sku, name, status: 'error', message: `Unknown category: ${categorySlug || '(empty)'}` });
        continue;
      }

      let brandId: string | null = null;
      const brandSlug = col(row, 'brand', 'brand_slug').toLowerCase();
      if (brandSlug) {
        brandId = brandBySlug.get(brandSlug) ?? null;
        if (!brandId) {
          push({ line, sku, name, status: 'error', message: `Unknown brand: ${brandSlug}` });
          continue;
        }
      }

      const price = parseFloat(col(row, 'price'));
      if (Number.isNaN(price) || price <= 0) {
        push({ line, sku, name, status: 'error', message: 'price must be a positive number' });
        continue;
      }

      const stock = parseInt(col(row, 'stock', 'stock_quantity'), 10);
      if (Number.isNaN(stock) || stock < 0) {
        push({ line, sku, name, status: 'error', message: 'stock must be 0 or more' });
        continue;
      }

      const saleStr = col(row, 'sale_price', 'discount_price');
      let discountPrice: number | null = null;
      if (saleStr) {
        discountPrice = parseFloat(saleStr);
        if (Number.isNaN(discountPrice) || discountPrice < 0) {
          push({ line, sku, name, status: 'error', message: 'sale_price invalid' });
          continue;
        }
      }

      let vatRateField = '';
      const vatStr = col(row, 'vat', 'vat_rate');
      if (vatStr) {
        const vatRate = parseFloat(vatStr);
        if (Number.isNaN(vatRate) || !isAllowedKosovoVatRate(vatRate)) {
          push({ line, sku, name, status: 'error', message: 'vat must be 0, 8, or 18' });
          continue;
        }
        vatRateField = String(vatRate);
      }

      const existingId = productBySku.get(sku.toLowerCase());
      if (existingId && !options.updateExisting) {
        push({ line, sku, name, status: 'skipped', message: 'SKU exists — tick “Update existing” to overwrite' });
        continue;
      }

      const imageName = col(row, 'image', 'image_file');
      const images: { url: string; alt: string }[] = [];
      if (imageName) {
        if (!options.zipBuffer?.length) {
          push({ line, sku, name, status: 'error', message: 'image set but no ZIP uploaded' });
          continue;
        }
        const url = await saveImageFromZip(zipIndex, imageName);
        if (!url) {
          push({ line, sku, name, status: 'error', message: `Image not in ZIP: ${imageName}` });
          continue;
        }
        images.push({ url, alt: name });
      }

      const payload = {
        name,
        sku,
        categoryId,
        brandId,
        price: String(price),
        discountPrice: discountPrice != null ? String(discountPrice) : '',
        vatRate: vatRateField,
        stockQuantity: String(stock),
        lowStockThreshold: '10',
        barcode: '',
        shortDescription: '',
        description: '',
        status: 'ACTIVE',
        isFeatured: '',
      };

      try {
        if (existingId) {
          await this.productService.update(existingId, {
            ...payload,
            ...(images.length ? { newImages: images } : {}),
          });
          push({ line, sku, name, status: 'updated' });
        } else {
          await this.productService.create({ ...payload, images });
          productBySku.set(sku.toLowerCase(), 'new');
          push({ line, sku, name, status: 'created' });
        }
      } catch (err: unknown) {
        push({
          line,
          sku,
          name,
          status: 'error',
          message: err instanceof Error ? err.message : 'Save failed',
        });
      }
    }

    return result;
  }
}
