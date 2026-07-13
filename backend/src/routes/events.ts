import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { MAX_TICKETS_PER_USER_PER_EVENT } from '../lib/pricing';

const router = Router();

router.get('/', async (req, res) => {
  const { category, featured, popular, search, city, artist, date, dateFrom, dateTo, month } =
    req.query as Record<string, string | undefined>;

  const where: Prisma.EventWhereInput = {};
  const and: Prisma.EventWhereInput[] = [];

  if (category) where.category = { equals: category, mode: 'insensitive' };
  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (featured === 'true') where.featured = true;
  if (popular === 'true') where.popular = true;
  if (artist) where.artist = { contains: artist, mode: 'insensitive' };
  if (date) where.date = date;
  if (month) where.date = { startsWith: month };

  if (dateFrom || dateTo) {
    where.date = {
      ...(typeof where.date === 'object' ? where.date : {}),
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {})
    };
  }

  if (search) {
    and.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } }
      ]
    });
  }

  if (and.length) where.AND = and;

  const events = await prisma.event.findMany({ where, orderBy: { date: 'asc' } });
  res.json(events);
});

router.get('/categories', async (_req, res) => {
  const rows = await prisma.event.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' }
  });
  res.json(rows.map((r) => r.category));
});

router.get('/cities', async (_req, res) => {
  const events = await prisma.event.findMany({ select: { city: true, department: true } });
  const cityMap: Record<string, { name: string; department: string; count: number }> = {};
  events.forEach((e) => {
    if (!cityMap[e.city]) {
      cityMap[e.city] = { name: e.city, department: e.department, count: 0 };
    }
    cityMap[e.city].count++;
  });
  res.json(Object.values(cityMap).sort((a, b) => b.count - a.count));
});

router.get('/:id/price-history', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(404).json({ error: 'Evento no encontrado' });

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

  const history = await prisma.priceHistory.findMany({
    where: { eventId: id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  res.json(history);
});

router.get('/:id/purchase-info', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(404).json({ error: 'Evento no encontrado' });

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

  const purchased = await prisma.order.aggregate({
    where: { userId: req.user!.id, eventId: id },
    _sum: { quantity: true }
  });
  const purchasedQty = purchased._sum.quantity ?? 0;
  const remaining = Math.max(MAX_TICKETS_PER_USER_PER_EVENT - purchasedQty, 0);
  const canPurchasePresale = event.salePhase !== 'presale' || req.user!.presaleAccess;

  res.json({
    purchasedQty,
    maxAllowed: MAX_TICKETS_PER_USER_PER_EVENT,
    remaining,
    canPurchasePresale,
    salePhase: event.salePhase
  });
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(404).json({ error: 'Evento no encontrado' });

  const event = await prisma.event.findUnique({
    where: { id },
    include: { tiers: { orderBy: { sortOrder: 'asc' } } }
  });
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(event);
});

export default router;
