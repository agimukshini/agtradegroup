import { PrismaClient, Role, ProductStatus, OrderStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Categories ────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Plumbing', slug: 'plumbing', description: 'Pipes, fittings, valves, and plumbing supplies', sortOrder: 1 } }),
    prisma.category.create({ data: { name: 'Heating', slug: 'heating', description: 'Heating systems, radiators, and boilers', sortOrder: 2 } }),
    prisma.category.create({ data: { name: 'Bathroom Equipment', slug: 'bathroom-equipment', description: 'Bathroom fixtures, showers, and accessories', sortOrder: 3 } }),
    prisma.category.create({ data: { name: 'Tools', slug: 'tools', description: 'Professional tools for plumbing and construction', sortOrder: 4 } }),
    prisma.category.create({ data: { name: 'Construction Accessories', slug: 'construction-accessories', description: 'Construction materials and accessories', sortOrder: 5 } }),
    prisma.category.create({ data: { name: 'Pipes', slug: 'pipes', description: 'PVC, copper, and PEX pipes', sortOrder: 6 } }),
    prisma.category.create({ data: { name: 'Valves', slug: 'valves', description: 'Ball valves, gate valves, and check valves', sortOrder: 7 } }),
    prisma.category.create({ data: { name: 'Pumps', slug: 'pumps', description: 'Water pumps and circulation systems', sortOrder: 8 } }),
    prisma.category.create({ data: { name: 'Boilers', slug: 'boilers', description: 'Gas and electric boilers', sortOrder: 9 } }),
    prisma.category.create({ data: { name: 'Floor Heating', slug: 'floor-heating', description: 'Underfloor heating systems', sortOrder: 10 } }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Sub-categories
  await prisma.category.createMany({
    data: [
      { name: 'PVC Pipes', slug: 'pvc-pipes', parentId: categories[5].id, sortOrder: 1 },
      { name: 'Copper Pipes', slug: 'copper-pipes', parentId: categories[5].id, sortOrder: 2 },
      { name: 'PEX Pipes', slug: 'pex-pipes', parentId: categories[5].id, sortOrder: 3 },
      { name: 'Ball Valves', slug: 'ball-valves', parentId: categories[6].id, sortOrder: 1 },
      { name: 'Gate Valves', slug: 'gate-valves', parentId: categories[6].id, sortOrder: 2 },
      { name: 'Pipe Wrenches', slug: 'pipe-wrenches', parentId: categories[3].id, sortOrder: 1 },
      { name: 'Pipe Cutters', slug: 'pipe-cutters', parentId: categories[3].id, sortOrder: 2 },
      { name: 'Soldering Tools', slug: 'soldering-tools', parentId: categories[3].id, sortOrder: 3 },
    ],
  });

  // ─── Brands ────────────────────────────────────────────────────────────
  const brands = await Promise.all([
    prisma.brand.create({ data: { name: 'Rehau', slug: 'rehau', description: 'Premium polymer solutions' } }),
    prisma.brand.create({ data: { name: 'Viega', slug: 'viega', description: 'Plumbing and HVAC technology' } }),
    prisma.brand.create({ data: { name: 'Bosch', slug: 'bosch', description: 'Heating and boiler systems' } }),
    prisma.brand.create({ data: { name: 'Grohe', slug: 'grohe', description: 'Bathroom fixtures' } }),
    prisma.brand.create({ data: { name: 'Watts', slug: 'watts', description: 'Valves and plumbing controls' } }),
    prisma.brand.create({ data: { name: 'Uponor', slug: 'uponor', description: 'Floor heating systems' } }),
    prisma.brand.create({ data: { name: 'Grundfos', slug: 'grundfos', description: 'Water pumps' } }),
    prisma.brand.create({ data: { name: 'Ridgid', slug: 'ridgid', description: 'Professional tools' } }),
  ]);

  console.log(`✅ Created ${brands.length} brands`);

  // ─── Products ──────────────────────────────────────────────────────────
  const products = [
    // Plumbing
    {
      name: 'PVC Pipe 20mm (100m Roll)',
      sku: 'PVC-20-100',
      barcode: '3830010000001',
      price: 45.00,
      discountPrice: 39.99,
      stockQuantity: 150,
      categoryId: categories[5].id,
      brandId: brands[0].id,
      description: 'High-quality PVC pipe for water supply and drainage. 20mm diameter, 100-meter roll. Suitable for cold water systems.',
      shortDescription: 'PVC pipe 20mm, 100m roll',
      isFeatured: true,
      specs: { diameter: '20mm', length: '100m', material: 'PVC', pressure: '10 bar' },
    },
    {
      name: 'PVC Pipe 32mm (50m Roll)',
      sku: 'PVC-32-50',
      barcode: '3830010000002',
      price: 65.00,
      stockQuantity: 80,
      categoryId: categories[5].id,
      brandId: brands[0].id,
      description: 'PVC pipe 32mm diameter for main water lines. 50-meter roll.',
      shortDescription: 'PVC pipe 32mm, 50m roll',
      specs: { diameter: '32mm', length: '50m', material: 'PVC' },
    },
    {
      name: 'Copper Pipe 15mm (25m)',
      sku: 'COP-15-25',
      barcode: '3830010000003',
      price: 120.00,
      stockQuantity: 45,
      categoryId: categories[5].id,
      description: 'Premium copper pipe for hot and cold water systems. 15mm diameter.',
      shortDescription: 'Copper pipe 15mm, 25m',
      isFeatured: true,
      specs: { diameter: '15mm', length: '25m', material: 'Copper' },
    },
    {
      name: 'PEX Pipe 16mm (200m Roll)',
      sku: 'PEX-16-200',
      barcode: '3830010000004',
      price: 89.00,
      discountPrice: 79.00,
      stockQuantity: 200,
      categoryId: categories[5].id,
      brandId: brands[0].id,
      description: 'Cross-linked polyethylene pipe for floor heating and water supply. 16mm, 200m roll.',
      shortDescription: 'PEX pipe 16mm, 200m roll',
      specs: { diameter: '16mm', length: '200m', material: 'PEX' },
    },
    // Valves
    {
      name: 'Ball Valve 1/2" Brass',
      sku: 'BV-12-BR',
      barcode: '3830010000005',
      price: 8.50,
      stockQuantity: 500,
      categoryId: categories[6].id,
      brandId: brands[4].id,
      description: 'Brass ball valve 1/2 inch for water systems. Full bore design.',
      shortDescription: 'Ball valve 1/2" brass',
      specs: { size: '1/2"', material: 'Brass', type: 'Full bore' },
    },
    {
      name: 'Ball Valve 3/4" Brass',
      sku: 'BV-34-BR',
      barcode: '3830010000006',
      price: 12.00,
      stockQuantity: 350,
      categoryId: categories[6].id,
      brandId: brands[4].id,
      description: 'Brass ball valve 3/4 inch. Heavy-duty construction.',
      shortDescription: 'Ball valve 3/4" brass',
      specs: { size: '3/4"', material: 'Brass' },
    },
    {
      name: 'Gate Valve 1" Brass',
      sku: 'GV-1-BR',
      barcode: '3830010000007',
      price: 18.00,
      stockQuantity: 200,
      categoryId: categories[6].id,
      brandId: brands[4].id,
      description: 'Gate valve 1 inch for isolation in water systems.',
      shortDescription: 'Gate valve 1" brass',
      specs: { size: '1"', material: 'Brass', type: 'Gate' },
    },
    // Heating
    {
      name: 'Panel Radiator 600x2000mm',
      sku: 'RAD-600-2000',
      barcode: '3830010000008',
      price: 185.00,
      discountPrice: 165.00,
      stockQuantity: 30,
      categoryId: categories[1].id,
      brandId: brands[2].id,
      description: 'Steel panel radiator 600x2000mm. High efficiency output. Suitable for central heating systems.',
      shortDescription: 'Panel radiator 600x2000mm',
      isFeatured: true,
      specs: { width: '600mm', height: '2000mm', material: 'Steel', output: '2200W' },
    },
    {
      name: 'Panel Radiator 600x1200mm',
      sku: 'RAD-600-1200',
      barcode: '3830010000009',
      price: 120.00,
      stockQuantity: 50,
      categoryId: categories[1].id,
      brandId: brands[2].id,
      description: 'Compact panel radiator for smaller rooms.',
      shortDescription: 'Panel radiator 600x1200mm',
      specs: { width: '600mm', height: '1200mm', material: 'Steel', output: '1400W' },
    },
    {
      name: 'Gas Boiler 24kW',
      sku: 'BOI-24-GAS',
      barcode: '3830010000010',
      price: 850.00,
      stockQuantity: 8,
      lowStockThreshold: 5,
      categoryId: categories[8].id,
      brandId: brands[2].id,
      description: 'High-efficiency gas boiler 24kW. Suitable for homes up to 200m². A-rated energy efficiency.',
      shortDescription: 'Gas boiler 24kW, A-rated',
      isFeatured: true,
      specs: { power: '24kW', fuel: 'Gas', efficiency: 'A', coverage: '200m²' },
    },
    // Bathroom
    {
      name: 'Bathroom Mixer Tap Chrome',
      sku: 'BAT-MIX-CHR',
      barcode: '3830010000011',
      price: 75.00,
      discountPrice: 65.00,
      stockQuantity: 60,
      categoryId: categories[2].id,
      brandId: brands[3].id,
      description: 'Chrome bathroom mixer tap with ceramic cartridge. Modern design.',
      shortDescription: 'Chrome bathroom mixer tap',
      specs: { finish: 'Chrome', type: 'Mixer', cartridge: 'Ceramic' },
    },
    {
      name: 'Rain Shower Head 30cm',
      sku: 'SHW-RN-30',
      barcode: '3830010000012',
      price: 55.00,
      stockQuantity: 40,
      categoryId: categories[2].id,
      brandId: brands[3].id,
      description: 'Large rain shower head 30cm diameter. Chrome finish with anti-lime scale nozzles.',
      shortDescription: 'Rain shower head 30cm chrome',
      specs: { diameter: '30cm', finish: 'Chrome', feature: 'Anti-lime scale' },
    },
    {
      name: 'Toilet Set Complete',
      sku: 'TOI-SET-01',
      barcode: '3830010000013',
      price: 195.00,
      stockQuantity: 20,
      categoryId: categories[2].id,
      brandId: brands[3].id,
      description: 'Complete toilet set including bowl, tank, and seat. Dual flush system.',
      shortDescription: 'Complete toilet set with dual flush',
      specs: { type: 'Floor-mounted', flush: 'Dual 3/6L', includes: 'Bowl, tank, seat' },
    },
    // Tools
    {
      name: 'Pipe Wrench 18"',
      sku: 'WRN-18',
      barcode: '3830010000014',
      price: 28.00,
      stockQuantity: 100,
      categoryId: categories[3].id,
      brandId: brands[7].id,
      description: 'Heavy-duty pipe wrench 18 inch. Forged steel construction.',
      shortDescription: 'Pipe wrench 18" forged steel',
      specs: { size: '18"', material: 'Forged steel' },
    },
    {
      name: 'Pipe Cutter for Copper 28mm',
      sku: 'CUT-COP-28',
      barcode: '3830010000015',
      price: 35.00,
      stockQuantity: 75,
      categoryId: categories[3].id,
      brandId: brands[7].id,
      description: 'Professional pipe cutter for copper pipes up to 28mm.',
      shortDescription: 'Pipe cutter for copper up to 28mm',
      specs: { maxDiameter: '28mm', material: 'Steel', type: 'Ratchet' },
    },
    {
      name: 'Soldering Kit Professional',
      sku: 'SOL-KIT-PRO',
      barcode: '3830010000016',
      price: 45.00,
      discountPrice: 39.00,
      stockQuantity: 60,
      categoryId: categories[3].id,
      description: 'Complete soldering kit with torch, solder wire, flux, and accessories.',
      shortDescription: 'Professional soldering kit',
      specs: { includes: 'Torch, solder, flux, brush', type: 'Gas' },
    },
    {
      name: 'PEX Crimping Tool Kit',
      sku: 'PEX-CRIMP-KIT',
      barcode: '3830010000017',
      price: 120.00,
      stockQuantity: 25,
      categoryId: categories[3].id,
      brandId: brands[0].id,
      description: 'PEX crimping tool kit with jaws for 16mm, 20mm, and 25mm pipes.',
      shortDescription: 'PEX crimping tool with jaw set',
      specs: { sizes: '16/20/25mm', includes: 'Tool + 3 jaw sets' },
    },
    // Construction Accessories
    {
      name: 'Teflon Tape 12mm (10 pack)',
      sku: 'TEF-12-10',
      barcode: '3830010000018',
      price: 5.00,
      stockQuantity: 1000,
      categoryId: categories[4].id,
      description: 'PTFE thread seal tape 12mm width. Pack of 10 rolls.',
      shortDescription: 'Teflon tape 12mm, 10-pack',
      specs: { width: '12mm', quantity: '10 rolls', material: 'PTFE' },
    },
    {
      name: 'Pipe Insulation 20mm (2m)',
      sku: 'INS-20-2',
      barcode: '3830010000019',
      price: 3.50,
      stockQuantity: 500,
      categoryId: categories[4].id,
      description: 'Foam pipe insulation for 20mm pipes. 2-meter length.',
      shortDescription: 'Pipe insulation foam 20mm, 2m',
      specs: { innerDiameter: '20mm', length: '2m', thickness: '9mm' },
    },
    {
      name: 'PVC Elbow 90° 20mm (10 pack)',
      sku: 'ELB-90-20-10',
      barcode: '3830010000020',
      price: 8.00,
      stockQuantity: 400,
      categoryId: categories[0].id,
      description: 'PVC 90-degree elbow fittings for 20mm pipes. Pack of 10.',
      shortDescription: 'PVC elbow 90° 20mm, 10-pack',
      specs: { angle: '90°', size: '20mm', quantity: '10', material: 'PVC' },
    },
    // Pumps
    {
      name: 'Circulation Pump 25-40',
      sku: 'PMP-CIR-2540',
      barcode: '3830010000021',
      price: 145.00,
      stockQuantity: 15,
      categoryId: categories[7].id,
      brandId: brands[6].id,
      description: 'High-efficiency circulation pump for heating systems. 25-40 model.',
      shortDescription: 'Circulation pump 25-40',
      isFeatured: true,
      specs: { model: '25-40', power: '45W', maxFlow: '3.5m³/h', maxHead: '4m' },
    },
    // Floor Heating
    {
      name: 'Floor Heating Manifold 4-Way',
      sku: 'FH-MAN-4',
      barcode: '3830010000022',
      price: 180.00,
      stockQuantity: 20,
      categoryId: categories[9].id,
      brandId: brands[5].id,
      description: 'Stainless steel floor heating manifold with 4 circuits. Includes flow meters.',
      shortDescription: 'Floor heating manifold 4 circuits',
      specs: { circuits: '4', material: 'Stainless steel', includes: 'Flow meters' },
    },
    {
      name: 'Floor Heating Manifold 8-Way',
      sku: 'FH-MAN-8',
      barcode: '3830010000023',
      price: 320.00,
      stockQuantity: 10,
      categoryId: categories[9].id,
      brandId: brands[5].id,
      description: 'Stainless steel floor heating manifold with 8 circuits.',
      shortDescription: 'Floor heating manifold 8 circuits',
      specs: { circuits: '8', material: 'Stainless steel', includes: 'Flow meters' },
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        status: ProductStatus.ACTIVE,
        images: {
          create: {
            url: `/images/placeholder-${p.sku.toLowerCase()}.jpg`,
            alt: p.name,
            isPrimary: true,
            sortOrder: 0,
          },
        },
      },
    });
  }

  console.log(`✅ Created ${products.length} products`);

  // ─── Users ─────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@agtradegroup.com',
      phone: '+38344000000',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'AgTrade',
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@agtradegroup.com',
      phone: '+38344000001',
      password: hashedPassword,
      firstName: 'Staff',
      lastName: 'Member',
      role: Role.STAFF,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@gmail.com',
      phone: '+38344123456',
      password: hashedPassword,
      firstName: 'Arben',
      lastName: 'Krasniqi',
      role: Role.CUSTOMER,
    },
  });

  console.log('✅ Created users (admin, staff, customer)');

  // ─── Addresses ─────────────────────────────────────────────────────────
  await prisma.address.create({
    data: {
      userId: customer.id,
      firstName: 'Arben',
      lastName: 'Krasniqi',
      phone: '+38344123456',
      city: 'Ferizaj',
      address: 'Rruga UÇK Nr. 15',
      zip: '70000',
      isDefault: true,
    },
  });

  // ─── Sample Orders ─────────────────────────────────────────────────────
  const allProducts = await prisma.product.findMany({ take: 20 });

  await prisma.order.create({
    data: {
      orderNumber: 'AGT-2605-0001',
      trackingNumber: 'AGTABC1234567890',
      status: OrderStatus.DELIVERED,
      subtotal: 158.49,
      shippingFee: 0,
      discount: 0,
      total: 158.49,
      paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
      paymentStatus: 'PAID',
      customerEmail: 'customer@gmail.com',
      customerPhone: '+38344123456',
      customerName: 'Arben Krasniqi',
      deliveryCity: 'Ferizaj',
      deliveryAddress: 'Rruga UÇK Nr. 15',
      deliveryZip: '70000',
      userId: customer.id,
      items: {
        create: [
          { productId: allProducts[0].id, quantity: 2, price: 39.99, total: 79.98 },
          { productId: allProducts[1].id, quantity: 5, price: 8.50, total: 42.50 },
          { productId: allProducts[2].id, quantity: 3, price: 5.00, total: 15.00 },
          { productId: allProducts[3].id, quantity: 6, price: 3.50, total: 21.00 },
        ],
      },
    },
  });

  console.log('✅ Created sample order');

  // ─── Promotions ────────────────────────────────────────────────────────
  await prisma.promotion.create({
    data: {
      name: 'Spring Sale - 10% Off Pipes',
      code: 'SPRING10',
      description: '10% discount on all pipe products',
      type: 'percentage',
      value: 10,
      minOrder: 50,
      maxUses: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.promotion.create({
    data: {
      name: 'Free Shipping Over 100 EUR',
      code: 'FREESHIP100',
      description: 'Free shipping on orders over 100 EUR',
      type: 'free_shipping',
      value: 0,
      minOrder: 100,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created promotions');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('📧 Admin login: admin@agtradegroup.com / Admin123!');
  console.log('📧 Staff login: staff@agtradegroup.com / Admin123!');
  console.log('📧 Customer login: customer@gmail.com / Admin123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
