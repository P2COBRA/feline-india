import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Pain Relief', slug: 'pain-relief', imageUrl: '/images/category-pain.svg', description: 'Relief for fever, pain and inflammation.' },
  { name: 'Diabetes Care', slug: 'diabetes-care', imageUrl: '/images/diabetes.svg', description: 'Control and monitor sugar levels.' },
  { name: 'Skin Care', slug: 'skin-care', imageUrl: '/images/skin-care.svg', description: 'Care for your skin and daily routine.' },
  { name: 'Vitamins & Supplements', slug: 'vitamins-supplements', imageUrl: '/images/vitamins.svg', description: 'Daily support for immunity and wellness.' },
  { name: 'Baby Care', slug: 'baby-care', imageUrl: '/images/baby-care.svg', description: 'Gentle care essentials for babies.' },
  { name: 'Ayurveda', slug: 'ayurveda', imageUrl: '/images/ayurveda.svg', description: 'Natural wellness rooted in Ayurveda.' },
  { name: 'Cough & Cold', slug: 'cough-cold', imageUrl: '/images/cough-cold.svg', description: 'Cold relief, cough syrups and care.' },
  { name: "Women's Health", slug: 'womens-health', imageUrl: '/images/womens-health.svg', description: 'Support for health and wellness needs.' }
];

const products = [
  { name: 'Paracetamol 500mg', slug: 'paracetamol-500mg', category: 'Pain Relief', manufacturer: 'Feline India', saltComposition: 'Paracetamol 500mg', mrp: 45, price: 32, discountPercent: 29, stock: 120, prescriptionRequired: false, description: 'Trusted pain and fever relief for daily use.', uses: 'Relief from fever, headache, body pain and toothache.', dosage: 'Take 1 tablet up to 4 times in 24 hours as directed by a physician.', sideEffects: 'Rare side effects may include nausea or rash. Consult a doctor for persistent symptoms.', storage: 'Store below 25°C in a cool, dry place.', images: ['/images/paracetamol-front.svg', '/images/paracetamol-pack.svg'], featured: true, rating: 4.6, reviewCount: 18 },
  { name: 'Cough Syrup', slug: 'cough-syrup', category: 'Cough & Cold', manufacturer: 'Feline India', saltComposition: 'Dextromethorphan + Chlorpheniramine', mrp: 140, price: 109, discountPercent: 22, stock: 90, prescriptionRequired: false, description: 'Effective relief from dry cough and congestion.', uses: 'Helps manage cough and nasal congestion.', dosage: 'Use as directed on the label or physician advice.', sideEffects: 'May cause drowsiness or dry mouth in some individuals.', storage: 'Store away from sunlight and moisture.', images: ['/images/cough.svg', '/images/med-bottle.svg'], featured: true, rating: 4.4, reviewCount: 12 },
  { name: 'Vitamin C Plus', slug: 'vitamin-c-plus', category: 'Vitamins & Supplements', manufacturer: 'Feline India', saltComposition: 'Vitamin C + Zinc', mrp: 260, price: 189, discountPercent: 27, stock: 80, prescriptionRequired: false, description: 'Boosts immunity and supports daily wellness.', uses: 'Maintains immunity and overall energy levels.', dosage: 'Take 1 tablet daily after food.', sideEffects: 'Usually well tolerated. Mild stomach upset possible.', storage: 'Store in a cool, dry place.', images: ['/images/vitamin.svg', '/images/med-strip.svg'], featured: true, rating: 4.5, reviewCount: 16 },
  { name: 'Blood Sugar Support', slug: 'blood-sugar-support', category: 'Diabetes Care', manufacturer: 'Feline India', saltComposition: 'Alpha Lipoic Acid + Chromium', mrp: 320, price: 249, discountPercent: 22, stock: 70, prescriptionRequired: true, description: 'Daily support for healthy glucose metabolism.', uses: 'Helps support metabolic health and routine sugar control.', dosage: 'Use as directed by your doctor.', sideEffects: 'Possible mild digestive discomfort.', storage: 'Keep sealed away from direct sunlight.', images: ['/images/diabetes-box.svg', '/images/med-strip.svg'], featured: false, rating: 4.2, reviewCount: 8 },
  { name: 'Hydrating Face Cream', slug: 'hydrating-face-cream', category: 'Skin Care', manufacturer: 'Feline India', saltComposition: 'Aloe Vera + Vitamin E', mrp: 390, price: 299, discountPercent: 23, stock: 65, prescriptionRequired: false, description: 'Moisturizes and nurtures dry skin.', uses: 'Hydrates and softens dry skin.', dosage: 'Apply regularly on clean skin.', sideEffects: 'Patch test recommended for sensitive skin.', storage: 'Store in a cool, dry place.', images: ['/images/cream.svg', '/images/pack.svg'], featured: false, rating: 4.3, reviewCount: 11 },
  { name: 'Baby Care Lotion', slug: 'baby-care-lotion', category: 'Baby Care', manufacturer: 'Feline India', saltComposition: 'Oat Extract + Almond Oil', mrp: 220, price: 179, discountPercent: 19, stock: 60, prescriptionRequired: false, description: 'Gentle baby lotion for soft and nourished skin.', uses: 'For everyday baby skin care.', dosage: 'Apply light amounts on the body and face.', sideEffects: 'Avoid eye area. Discontinue if irritation occurs.', storage: 'Store below 30°C.', images: ['/images/baby.svg', '/images/med-bottle.svg'], featured: false, rating: 4.6, reviewCount: 13 },
  { name: 'Immunity Gummies', slug: 'immunity-gummies', category: 'Vitamins & Supplements', manufacturer: 'Feline India', saltComposition: 'Vitamin D3 + Zinc', mrp: 420, price: 329, discountPercent: 22, stock: 100, prescriptionRequired: false, description: 'Tasty immunity support for adults and children.', uses: 'Helps support immune function and vitality.', dosage: 'One gummy per day or as directed.', sideEffects: 'Rare gastrointestinal discomfort.', storage: 'Store in a cool dry place.', images: ['/images/gummies.svg', '/images/med-pack.svg'], featured: true, rating: 4.7, reviewCount: 20 },
  { name: 'Ayurvedic Immunity Kit', slug: 'ayurvedic-immunity-kit', category: 'Ayurveda', manufacturer: 'Feline India', saltComposition: 'Ashwagandha + Tulsi', mrp: 510, price: 399, discountPercent: 22, stock: 55, prescriptionRequired: false, description: 'Traditional ayurvedic blend to support vitality and immunity.', uses: 'Supports general wellness and daily vitality.', dosage: 'Take as directed on pack or physician advice.', sideEffects: 'Avoid if pregnant or on medication without advice.', storage: 'Store in airtight container below 30°C.', images: ['/images/ayurveda-bottle.svg', '/images/med-pack.svg'], featured: true, rating: 4.5, reviewCount: 10 },
  { name: 'Calcium Plus', slug: 'calcium-plus', category: "Women's Health", manufacturer: 'Feline India', saltComposition: 'Calcium + Vitamin D', mrp: 280, price: 219, discountPercent: 22, stock: 85, prescriptionRequired: false, description: 'Support for bone health and daily vitality.', uses: 'Helps maintain strong bones and everyday energy.', dosage: 'Take 1 tablet daily with food.', sideEffects: 'Minor constipation may occur rarely.', storage: 'Keep in a dry place away from sunlight.', images: ['/images/calcium.svg', '/images/med-strip.svg'], featured: false, rating: 4.4, reviewCount: 14 },
  { name: 'Pain Relief Spray', slug: 'pain-relief-spray', category: 'Pain Relief', manufacturer: 'Feline India', saltComposition: 'Diclofenac Sodium', mrp: 210, price: 169, discountPercent: 20, stock: 40, prescriptionRequired: true, description: 'Fast-acting localized pain relief spray.', uses: 'Used for muscle and joint discomfort.', dosage: 'Apply as directed on the affected area.', sideEffects: 'Temporary skin irritation may occur.', storage: 'Store below 30°C away from heat.', images: ['/images/spray.svg', '/images/pack.svg'], featured: false, rating: 4.3, reviewCount: 6 }
];

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@felineindia.com' },
    update: {},
    create: {
      name: 'Feline Admin',
      email: 'admin@felineindia.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN'
    }
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }

  const categoryLookup = new Map(categories.map((category) => [category.name, category.slug]));

  for (const product of products) {
    const assignedSlug = categoryLookup.get(product.category) || product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = await prisma.category.findUnique({ where: { slug: assignedSlug } });

    if (!category) {
      console.warn(`Missing category for product: ${product.name} (${assignedSlug})`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        name: product.name,
        slug: product.slug,
        categoryId: category.id,
        manufacturer: product.manufacturer,
        saltComposition: product.saltComposition,
        mrp: product.mrp,
        price: product.price,
        prescriptionRequired: product.prescriptionRequired,
        description: product.description,
        uses: product.uses,
        dosage: product.dosage,
        sideEffects: product.sideEffects,
        storage: product.storage,
        images: JSON.stringify(product.images),
        discountPercent: product.discountPercent || 0,
        stock: product.stock || 0,
        featured: product.featured || false,
        rating: product.rating || 4.0,
        reviewCount: product.reviewCount || 0
      }
    });
  }

  await prisma.banner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'Care for everyday wellness',
      imageUrl: '/images/banner-1.svg',
      link: '/products',
      active: true
    }
  });

  await prisma.coupon.upsert({
    where: { code: 'FIRST10' },
    update: {},
    create: {
      code: 'FIRST10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderValue: 500,
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      active: true
    }
  });

  console.log('Seed complete');
  console.log('Admin account:', adminUser.email, 'admin123');
  console.log('Products seeded:', products.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
