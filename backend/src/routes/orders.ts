import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

interface RequestedItem {
  tierId: number;
  quantity: number;
}

router.post('/', authMiddleware, async (req, res) => {
  const { eventId, items } = req.body ?? {};

  if (!eventId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Evento y al menos un tipo de boleta son requeridos' });
  }

  const cleaned: RequestedItem[] = items
    .map((i: { tierId?: unknown; quantity?: unknown }) => ({
      tierId: Number(i.tierId),
      quantity: Number(i.quantity)
    }))
    .filter((i: RequestedItem) => Number.isInteger(i.tierId) && i.quantity > 0);

  if (cleaned.length === 0) {
    return res.status(400).json({ error: 'Selecciona al menos una boleta' });
  }

  const totalQuantity = cleaned.reduce((sum, i) => sum + i.quantity, 0);
  if (totalQuantity < 1 || totalQuantity > 10) {
    return res.status(400).json({ error: 'Puedes comprar entre 1 y 10 boletas por orden' });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: Number(eventId) } });
      if (!event) throw new Error('EVENT_NOT_FOUND');

      const discountFactor = event.discount > 0 ? 1 - event.discount / 100 : 1;

      const orderItemsData: {
        tierId: number;
        tierName: string;
        unitPrice: number;
        quantity: number;
        subtotal: number;
      }[] = [];
      let totalPrice = 0;

      for (const item of cleaned) {
        const tier = await tx.ticketTier.findUnique({ where: { id: item.tierId } });
        if (!tier || tier.eventId !== event.id) throw new Error('TIER_NOT_FOUND');
        if (item.quantity > tier.available) throw new Error('NOT_ENOUGH_TICKETS');

        const unitPrice = Math.round(tier.price * discountFactor);
        const subtotal = unitPrice * item.quantity;
        totalPrice += subtotal;

        await tx.ticketTier.update({
          where: { id: tier.id },
          data: { available: tier.available - item.quantity }
        });

        orderItemsData.push({
          tierId: tier.id,
          tierName: tier.name,
          unitPrice,
          quantity: item.quantity,
          subtotal
        });
      }

      await tx.event.update({
        where: { id: event.id },
        data: { availableTickets: Math.max(event.availableTickets - totalQuantity, 0) }
      });

      return tx.order.create({
        data: {
          userId: req.user!.id,
          eventId: event.id,
          eventTitle: event.title,
          eventCity: event.city,
          eventDate: event.date,
          quantity: totalQuantity,
          buyerName: req.user!.name,
          buyerEmail: req.user!.email,
          totalPrice,
          confirmationCode: `MS-${Date.now().toString(36).toUpperCase()}`,
          items: { create: orderItemsData }
        },
        include: { items: { orderBy: { id: 'asc' } } }
      });
    });

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof Error && err.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    if (err instanceof Error && err.message === 'TIER_NOT_FOUND') {
      return res.status(400).json({ error: 'Tipo de boleta inválido' });
    }
    if (err instanceof Error && err.message === 'NOT_ENOUGH_TICKETS') {
      return res.status(400).json({ error: 'No hay suficientes boletas disponibles' });
    }
    return res.status(500).json({ error: 'No se pudo procesar la compra' });
  }
});

router.get('/my', authMiddleware, async (req, res) => {
  const userOrders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { orderBy: { id: 'asc' } } }
  });
  res.json(userOrders);
});

export default router;
