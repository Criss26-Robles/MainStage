import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

interface NormalizedTier {
  name: string;
  price: number;
  available: number;
  description: string;
  sortOrder: number;
}

function normalizeTiers(raw: unknown): NormalizedTier[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((t: { name?: unknown; price?: unknown; available?: unknown; description?: unknown }, index: number) => ({
      name: String(t?.name ?? '').trim(),
      price: parseInt(String(t?.price), 10),
      available: parseInt(String(t?.available), 10),
      description: String(t?.description ?? ''),
      sortOrder: index
    }))
    .filter(
      (t: NormalizedTier) =>
        t.name.length > 0 &&
        Number.isFinite(t.price) &&
        t.price >= 0 &&
        Number.isFinite(t.available) &&
        t.available >= 0
    );
}

function normalizeSalePhase(value: unknown): string {
  const phase = String(value ?? 'general').toLowerCase();
  return phase === 'presale' ? 'presale' : 'general';
}

function normalizeServiceFeePercent(value: unknown): number {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return 10;
  return Math.min(50, Math.max(0, n));
}

function normalizeFocus(value: unknown, fallback = 50): number {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, n));
}

router.use(authMiddleware, adminMiddleware);

router.patch('/users/:id/presale', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const presaleAccess =
    req.body.presaleAccess !== undefined ? !!req.body.presaleAccess : !user.presaleAccess;
  const updated = await prisma.user.update({
    where: { id },
    data: { presaleAccess },
    select: { id: true, name: true, email: true, role: true, presaleAccess: true, createdAt: true }
  });
  res.json(updated);
});

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, role: true, presaleAccess: true, createdAt: true }
  });
  res.json(users);
});

router.get('/stats', async (_req, res) => {
  const [orders, totalEvents] = await Promise.all([
    prisma.order.findMany({ orderBy: { id: 'asc' } }),
    prisma.event.count()
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalTickets = orders.reduce((sum, o) => sum + o.quantity, 0);

  const salesByEvent: Record<number, { eventTitle: string; tickets: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (!salesByEvent[o.eventId]) {
      salesByEvent[o.eventId] = { eventTitle: o.eventTitle, tickets: 0, revenue: 0 };
    }
    salesByEvent[o.eventId].tickets += o.quantity;
    salesByEvent[o.eventId].revenue += o.totalPrice;
  });

  res.json({
    totalOrders: orders.length,
    totalRevenue,
    totalTickets,
    totalEvents,
    recentOrders: orders.slice(-5).reverse(),
    topEvents: Object.values(salesByEvent)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  });
});

router.get('/orders', async (_req, res) => {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

router.get('/events', async (_req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { date: 'asc' },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } }
  });
  res.json(events);
});

router.post('/events', async (req, res) => {
  const required = ['title', 'artist', 'category', 'date', 'time', 'venue', 'city', 'department'];
  for (const field of required) {
    if (req.body[field] === undefined || req.body[field] === '') {
      return res.status(400).json({ error: `El campo "${field}" es requerido` });
    }
  }

  const tiers = normalizeTiers(req.body.tiers);
  if (tiers.length === 0) {
    return res.status(400).json({ error: 'Agrega al menos un tipo de boleta' });
  }

  const price = Math.min(...tiers.map((t) => t.price));
  const availableTickets = tiers.reduce((sum, t) => sum + t.available, 0);

  const event = await prisma.event.create({
    data: {
      title: req.body.title,
      artist: req.body.artist,
      category: req.body.category,
      date: req.body.date,
      time: req.body.time,
      venue: req.body.venue,
      city: req.body.city,
      department: req.body.department,
      price,
      image: req.body.image || 'https://images.unsplash.com/photo-1459749411175-04bf3852a859?w=800&q=80',
      imageFocusX: normalizeFocus(req.body.imageFocusX),
      imageFocusY: normalizeFocus(req.body.imageFocusY),
      description: req.body.description || '',
      availableTickets,
      featured: !!req.body.featured,
      popular: !!req.body.popular,
      discount: parseInt(req.body.discount, 10) || 0,
      serviceFeePercent: normalizeServiceFeePercent(req.body.serviceFeePercent),
      salePhase: normalizeSalePhase(req.body.salePhase),
      tags: Array.isArray(req.body.tags) ? req.body.tags : [],
      tiers: { create: tiers }
    },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } }
  });

  res.status(201).json(event);
});

router.put('/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Evento no encontrado' });

  const tiers = normalizeTiers(req.body.tiers);
  const hasTiers = tiers.length > 0;
  const price = hasTiers ? Math.min(...tiers.map((t) => t.price)) : existing.price;
  const availableTickets = hasTiers
    ? tiers.reduce((sum, t) => sum + t.available, 0)
    : existing.availableTickets;

  const updated = await prisma.$transaction(async (tx) => {
    if (hasTiers) {
      await tx.ticketTier.deleteMany({ where: { eventId: id } });
    }
    return tx.event.update({
      where: { id },
      data: {
        title: req.body.title ?? existing.title,
        artist: req.body.artist ?? existing.artist,
        category: req.body.category ?? existing.category,
        date: req.body.date ?? existing.date,
        time: req.body.time ?? existing.time,
        venue: req.body.venue ?? existing.venue,
        city: req.body.city ?? existing.city,
        department: req.body.department ?? existing.department,
        price,
        image: req.body.image ?? existing.image,
        imageFocusX: req.body.imageFocusX !== undefined ? normalizeFocus(req.body.imageFocusX) : existing.imageFocusX,
        imageFocusY: req.body.imageFocusY !== undefined ? normalizeFocus(req.body.imageFocusY) : existing.imageFocusY,
        description: req.body.description ?? existing.description,
        availableTickets,
        featured: req.body.featured !== undefined ? !!req.body.featured : existing.featured,
        popular: req.body.popular !== undefined ? !!req.body.popular : existing.popular,
        discount: req.body.discount !== undefined ? parseInt(req.body.discount, 10) : existing.discount,
        serviceFeePercent:
          req.body.serviceFeePercent !== undefined
            ? normalizeServiceFeePercent(req.body.serviceFeePercent)
            : existing.serviceFeePercent,
        salePhase:
          req.body.salePhase !== undefined ? normalizeSalePhase(req.body.salePhase) : existing.salePhase,
        tags: Array.isArray(req.body.tags) ? req.body.tags : existing.tags,
        ...(hasTiers ? { tiers: { create: tiers } } : {})
      },
      include: { tiers: { orderBy: { sortOrder: 'asc' } } }
    });
  });

  res.json(updated);
});

router.delete('/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Evento no encontrado' });

  await prisma.order.deleteMany({ where: { eventId: id } });
  await prisma.event.delete({ where: { id } });
  res.json({ message: 'Evento eliminado' });
});

export default router;
