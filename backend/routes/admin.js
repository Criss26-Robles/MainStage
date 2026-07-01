const express = require('express');
const eventsStore = require('../utils/eventsStore');
const ordersStore = require('../utils/ordersStore');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', (_req, res) => {
  const orders = ordersStore.getAll();
  const events = eventsStore.getAll();

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalTickets = orders.reduce((sum, o) => sum + o.quantity, 0);

  const salesByEvent = {};
  orders.forEach(o => {
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
    totalEvents: events.length,
    recentOrders: orders.slice(-5).reverse(),
    topEvents: Object.values(salesByEvent)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  });
});

router.get('/orders', (_req, res) => {
  const orders = ordersStore.getAll()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

router.get('/events', (_req, res) => {
  res.json(eventsStore.getAll().sort((a, b) => a.date.localeCompare(b.date)));
});

router.post('/events', (req, res) => {
  const required = ['title', 'artist', 'category', 'date', 'time', 'venue', 'city', 'department', 'price'];
  for (const field of required) {
    if (req.body[field] === undefined || req.body[field] === '') {
      return res.status(400).json({ error: `El campo "${field}" es requerido` });
    }
  }

  const event = eventsStore.create({
    title: req.body.title,
    artist: req.body.artist,
    category: req.body.category,
    date: req.body.date,
    time: req.body.time,
    venue: req.body.venue,
    city: req.body.city,
    department: req.body.department,
    price: parseInt(req.body.price),
    image: req.body.image || 'https://images.unsplash.com/photo-1459749411175-04bf3852a859?w=800&q=80',
    description: req.body.description || '',
    availableTickets: parseInt(req.body.availableTickets) || 100,
    featured: !!req.body.featured,
    popular: !!req.body.popular,
    discount: parseInt(req.body.discount) || 0,
    tags: req.body.tags || []
  });

  res.status(201).json(event);
});

router.put('/events/:id', (req, res) => {
  const existing = eventsStore.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Evento no encontrado' });

  const updated = eventsStore.update(req.params.id, {
    title: req.body.title ?? existing.title,
    artist: req.body.artist ?? existing.artist,
    category: req.body.category ?? existing.category,
    date: req.body.date ?? existing.date,
    time: req.body.time ?? existing.time,
    venue: req.body.venue ?? existing.venue,
    city: req.body.city ?? existing.city,
    department: req.body.department ?? existing.department,
    price: req.body.price !== undefined ? parseInt(req.body.price) : existing.price,
    image: req.body.image ?? existing.image,
    description: req.body.description ?? existing.description,
    availableTickets: req.body.availableTickets !== undefined
      ? parseInt(req.body.availableTickets)
      : existing.availableTickets,
    featured: req.body.featured !== undefined ? !!req.body.featured : existing.featured,
    popular: req.body.popular !== undefined ? !!req.body.popular : existing.popular,
    discount: req.body.discount !== undefined ? parseInt(req.body.discount) : existing.discount,
    tags: req.body.tags ?? existing.tags
  });

  res.json(updated);
});

router.delete('/events/:id', (req, res) => {
  const deleted = eventsStore.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ message: 'Evento eliminado' });
});

module.exports = router;
