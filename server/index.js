import express from 'express';
import session from 'express-session';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
if (!fs.existsSync(path.resolve(process.cwd(), '.env')) && fs.existsSync(path.resolve(process.cwd(), '../.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
}
process.env.DATABASE_URL ||= 'file:./prisma/dev.db';
process.env.AUTO_ADMIN_LOGIN ||= 'true';

const prisma = new PrismaClient();
const app = express();
const projectRoot = path.basename(process.cwd()).toLowerCase() === 'server' ? path.resolve(process.cwd(), '..') : process.cwd();
const uploadsDir = path.join(projectRoot, 'server', 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});
const upload = multer({ storage });

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use('/images', express.static(path.join(projectRoot, 'client', 'public', 'images')));
app.use(express.static(path.join(projectRoot, 'client', 'dist')));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

function ensureAuth(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  next();
}

function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}

function formatProduct(product) {
  return {
    ...product,
    images: JSON.parse(product.images || '[]')
  };
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

app.get('/api/banners', async (_req, res) => {
  const banners = await prisma.banner.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
  res.json(banners);
});

app.get('/api/offers', async (_req, res) => {
  const now = new Date();
  const offers = await prisma.coupon.findMany({
    where: { active: true, expiryDate: { gt: now } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(offers);
});

app.get('/api/products', async (req, res) => {
  const { category, search, minPrice, maxPrice, prescription, inStock, sortBy } = req.query;
  const where = {};

  if (category) where.category = { slug: category };
  if (search) where.OR = [{ name: { contains: search } }, { saltComposition: { contains: search } }, { manufacturer: { contains: search } }];
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (prescription !== undefined) where.prescriptionRequired = prescription === 'true';
  if (inStock === 'true') where.stock = { gt: 0 };

  const orderBy = {};
  if (sortBy === 'price-asc') orderBy.price = 'asc';
  else if (sortBy === 'price-desc') orderBy.price = 'desc';
  else if (sortBy === 'discount') orderBy.discountPercent = 'desc';
  else orderBy.createdAt = 'desc';

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy
  });

  res.json(products.map(formatProduct));
});

app.get('/api/products/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: { category: true, reviews: { include: { user: true } } }
  });

  if (!product) return res.status(404).json({ message: 'Product not found.' });

  const formatted = formatProduct(product);
  res.json({ ...formatted, reviews: product.reviews });
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed }
  });

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage };
  res.json({ user: req.session.user });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid email or password.' });

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage };
  res.json({ user: req.session.user });
});

app.post('/api/admin/auto-login', async (req, res) => {
  if (process.env.AUTO_ADMIN_LOGIN !== 'true') {
    return res.status(404).json({ message: 'Demo admin login is disabled.' });
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!admin) return res.status(404).json({ message: 'Admin account not found.' });

  req.session.user = { id: admin.id, name: admin.name, email: admin.email, role: admin.role, profileImage: admin.profileImage };
  res.json({ user: req.session.user });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.get('/api/settings', async (_req, res) => {
  const settings = await prisma.siteSetting.findMany();
  res.json(Object.fromEntries(settings.map((setting) => [setting.key, setting.value])));
});

app.put('/api/profile', ensureAuth, async (req, res) => {
  const { name, profileImage } = req.body;
  const user = await prisma.user.update({
    where: { id: req.session.user.id },
    data: { ...(name ? { name } : {}), ...(profileImage ? { profileImage } : {}) }
  });
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage };
  res.json({ user: req.session.user });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }

  await prisma.contactMessage.create({
    data: { name, email, phone: phone || '', subject, message }
  });

  res.json({ success: true, message: 'Thanks for your message.' });
});

app.post('/api/orders', ensureAuth, async (req, res) => {
  const { items, shippingAddress, paymentMethod, total } = req.body;
  if (!items || !shippingAddress || !paymentMethod || !total) {
    return res.status(400).json({ message: 'Order details are required.' });
  }

  const order = await prisma.order.create({
    data: {
      userId: req.session.user.id,
      items: JSON.stringify(items),
      total: Number(total),
      paymentMethod,
      shippingAddress: JSON.stringify(shippingAddress),
      status: 'Placed'
    }
  });

  res.status(201).json({ order });
});

app.get('/api/orders/my', ensureAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders.map((order) => ({ ...order, items: JSON.parse(order.items || '[]'), shippingAddress: JSON.parse(order.shippingAddress || '{}') })));
});

app.get('/api/admin/products', ensureAuth, ensureAdmin, async (_req, res) => {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  res.json(products.map(formatProduct));
});

app.put('/api/admin/settings/:key', ensureAuth, ensureAdmin, async (req, res) => {
  const setting = await prisma.siteSetting.upsert({
    where: { key: req.params.key },
    update: { value: String(req.body.value || '') },
    create: { key: req.params.key, value: String(req.body.value || '') }
  });
  res.json(setting);
});

app.post('/api/admin/products', ensureAuth, ensureAdmin, async (req, res) => {
  const { categoryName, ...payload } = req.body;
  const category = await prisma.category.upsert({
    where: { slug: (categoryName || payload.categorySlug || 'general').toLowerCase().replace(/\s+/g, '-') },
    update: {},
    create: {
      name: categoryName || payload.categoryName || 'General',
      slug: (categoryName || payload.categoryName || 'General').toLowerCase().replace(/\s+/g, '-'),
      description: 'General category'
    }
  });

  const product = await prisma.product.create({
    data: {
      ...payload,
      categoryId: category.id,
      images: JSON.stringify(payload.images || ['/images/paracetamol-front.svg']),
      price: Number(payload.price),
      mrp: Number(payload.mrp),
      discountPercent: Number(payload.discountPercent || 0),
      stock: Number(payload.stock || 0),
      rating: Number(payload.rating || 0),
      reviewCount: Number(payload.reviewCount || 0),
      slug: (payload.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    },
    include: { category: true }
  });

  res.status(201).json(formatProduct(product));
});

app.put('/api/admin/products/:id', ensureAuth, ensureAdmin, async (req, res) => {
  const productId = Number(req.params.id);
  const { categoryName, images, ...productData } = req.body;
  let categoryId = productData.categoryId;

  if (categoryName) {
    const category = await prisma.category.findFirst({ where: { name: categoryName } });
    if (!category) return res.status(400).json({ message: 'Category not found.' });
    categoryId = category.id;
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      ...productData,
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
      price: Number(productData.price),
      mrp: Number(productData.mrp),
      discountPercent: Number(productData.discountPercent || 0),
      stock: Number(productData.stock || 0),
      images: JSON.stringify(images || [])
    },
    include: { category: true }
  });
  res.json(formatProduct(product));
});

app.delete('/api/admin/products/:id', ensureAuth, ensureAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

app.get('/api/admin/categories', ensureAuth, ensureAdmin, async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

app.post('/api/admin/categories', ensureAuth, ensureAdmin, async (req, res) => {
  const { name, description, imageUrl } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name is required.' });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const category = await prisma.category.create({ data: { name, slug, description: description || '', imageUrl: imageUrl || '/images/category-default.svg' } });
  res.status(201).json(category);
});

app.put('/api/admin/categories/:id', ensureAuth, ensureAdmin, async (req, res) => {
  const category = await prisma.category.update({ where: { id: Number(req.params.id) }, data: req.body });
  res.json(category);
});

app.delete('/api/admin/categories/:id', ensureAuth, ensureAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

app.get('/api/admin/banners', ensureAuth, ensureAdmin, async (_req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(banners);
});

app.post('/api/admin/banners', ensureAuth, ensureAdmin, async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  res.status(201).json(banner);
});

app.delete('/api/admin/banners/:id', ensureAuth, ensureAdmin, async (req, res) => {
  await prisma.banner.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

app.get('/api/admin/offers', ensureAuth, ensureAdmin, async (_req, res) => {
  const offers = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(offers);
});

app.post('/api/admin/offers', ensureAuth, ensureAdmin, async (req, res) => {
  const data = {
    ...req.body,
    value: Number(req.body.value),
    minOrderValue: Number(req.body.minOrderValue || 0),
    expiryDate: new Date(req.body.expiryDate)
  };
  const offer = await prisma.coupon.create({ data });
  res.status(201).json(offer);
});

app.delete('/api/admin/offers/:id', ensureAuth, ensureAdmin, async (req, res) => {
  await prisma.coupon.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

app.get('/api/admin/orders', ensureAuth, ensureAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
  res.json(orders.map((order) => ({
    ...order,
    items: JSON.parse(order.items || '[]'),
    shippingAddress: JSON.parse(order.shippingAddress || '{}')
  })));
});

app.put('/api/admin/orders/:id', ensureAuth, ensureAdmin, async (req, res) => {
  const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status: req.body.status } });
  res.json(order);
});

app.get('/api/admin/messages', ensureAuth, ensureAdmin, async (_req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(messages);
});

if (process.env.NODE_ENV === 'production') {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(projectRoot, 'client', 'dist', 'index.html'));
  });
}

app.post('/api/upload', ensureAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Upload failed.' });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ url: fileUrl });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong.' });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`FELINE INDIA API listening on http://localhost:${port}`);
});
