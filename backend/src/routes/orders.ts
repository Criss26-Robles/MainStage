import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  const { eventId, quantity } = req.body ?? {};

  if (!eventId || !quantity) {
    return res.status(400).json({ error: 'Evento y cantidad son requeridos' });
  }

  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Cantidad debe ser entre 1 y 10' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: Number(eventId) } });
      if (!event) throw new Error('EVENT_NOT_FOUND');

      if (quantity > event.availableTickets) {
        throw new Error('NOT_ENOUGH_TICKETS');
      }

      await tx.event.update({
        where: { id: event.id },
        data: { availableTickets: event.availableTickets - quantity }
      });

      const discountedPrice =
        event.discount > 0 ? Math.round(event.price * (1 - event.discount / 100)) : event.price;

      return tx.order.create({
        data: {
          userId: req.user!.id,
          eventId: event.id,
          eventTitle: event.title,
          eventCity: event.city,
          eventDate: event.date,
          quantity,
          buyerName: req.user!.name,
          buyerEmail: req.user!.email,
          totalPrice: discountedPrice * quantity,
          confirmationCode: `MS-${Date.now().toString(36).toUpperCase()}`
        }
      });
    });

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof Error && err.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    if (err instanceof Error && err.message === 'NOT_ENOUGH_TICKETS') {
      return res.status(400).json({ error: 'No hay suficientes boletos disponibles' });
    }
    return res.status(500).json({ error: 'No se pudo procesar la compra' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  const userOrders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(userOrders);
});

export default router;
