import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware, adminMiddleware);

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
  const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
  res.json(events);
});

router.post('/events', async (req, res) => {
  const required = ['title', 'artist', 'category', 'date', 'time', 'venue', 'city', 'department', 'price'];
  for (const field of required) {
    if (req.body[field] === undefined || req.body[field] === '') {
      return res.status(400).json({ error: `El campo "${field}" es requerido` });
    }
  }

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
      price: parseInt(req.body.price, 10),
      image: req.body.image || 'https://images.unsplash.com/photo-1459749411175-04bf3852a859?w=800&q=80',
      description: req.body.description || '',
      availableTickets: parseInt(req.body.availableTickets, 10) || 100,
      featured: !!req.body.featured,
      popular: !!req.body.popular,
      discount: parseInt(req.body.discount, 10) || 0,
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    }
  });

  res.status(201).json(event);
});

router.put('/events/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Evento no encontrado' });

  const updated = await prisma.event.update({
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
      price: req.body.price !== undefined ? parseInt(req.body.price, 10) : existing.price,
      image: req.body.image ?? existing.image,
      description: req.body.description ?? existing.description,
      availableTickets:
        req.body.availableTickets !== undefined
          ? parseInt(req.body.availableTickets, 10)
          : existing.availableTickets,
      featured: req.body.featured !== undefined ? !!req.body.featured : existing.featured,
      popular: req.body.popular !== undefined ? !!req.body.popular : existing.popular,
      discount: req.body.discount !== undefined ? parseInt(req.body.discount, 10) : existing.discount,
      tags: Array.isArray(req.body.tags) ? req.body.tags : existing.tags
    }
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
