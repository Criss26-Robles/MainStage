const express = require('express');
const eventsStore = require('../utils/eventsStore');
const ordersStore = require('../utils/ordersStore');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, (req, res) => {
  const { eventId, quantity } = req.body;

  if (!eventId || !quantity) {
    return res.status(400).json({ error: 'Evento y cantidad son requeridos' });
  }

  const event = eventsStore.findById(eventId);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Cantidad debe ser entre 1 y 10' });
  }

  if (quantity > event.availableTickets) {
    return res.status(400).json({ error: 'No hay suficientes boletos disponibles' });
  }

  eventsStore.update(event.id, {
    availableTickets: event.availableTickets - quantity
  });

  const discountedPrice = event.discount > 0
    ? Math.round(event.price * (1 - event.discount / 100))
    : event.price;

  const order = ordersStore.create({
    userId: req.user.id,
    eventId: event.id,
    eventTitle: event.title,
    eventCity: event.city,
    eventDate: event.date,
    quantity,
    buyerName: req.user.name,
    buyerEmail: req.user.email,
    totalPrice: discountedPrice * quantity,
    createdAt: new Date().toISOString(),
    confirmationCode: `MS-${Date.now().toString(36).toUpperCase()}`
  });

  res.status(201).json(order);
});

router.get('/my', authMiddleware, (req, res) => {
  const userOrders = ordersStore.getByUserId(req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

module.exports = router;
