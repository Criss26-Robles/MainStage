import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

function listingSelect() {
  return {
    id: true,
    askPrice: true,
    status: true,
    createdAt: true,
    soldAt: true,
    order: {
      select: {
        id: true,
        eventTitle: true,
        eventCity: true,
        eventDate: true,
        quantity: true,
        totalPrice: true
      }
    },
    seller: { select: { id: true, name: true } }
  } as const;
}

router.get('/', async (_req, res) => {
  const listings = await prisma.resale.findMany({
    where: { status: 'listed' },
    orderBy: { createdAt: 'desc' },
    select: listingSelect()
  });
  res.json(listings);
});

router.get('/my', authMiddleware, async (req, res) => {
  const listings = await prisma.resale.findMany({
    where: { sellerId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    select: listingSelect()
  });
  res.json(listings);
});

router.post('/', authMiddleware, async (req, res) => {
  const { orderId, askPrice } = req.body ?? {};
  const price = parseInt(String(askPrice), 10);

  if (!orderId || !Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: 'Orden y precio de reventa son requeridos' });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { resale: true }
  });

  if (!order || order.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }
  if (order.status !== 'active') {
    return res.status(400).json({ error: 'Esta orden no está disponible para reventa' });
  }
  if (order.qrUsed) {
    return res.status(400).json({ error: 'No puedes revender un boleto ya utilizado' });
  }
  if (order.resale) {
    return res.status(400).json({ error: 'Esta orden ya está publicada en reventa' });
  }

  const listing = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'listed' }
    });
    return tx.resale.create({
      data: {
        orderId: order.id,
        sellerId: req.user!.id,
        askPrice: price,
        status: 'listed'
      },
      select: listingSelect()
    });
  });

  res.status(201).json(listing);
});

router.post('/:id/buy', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const listing = await prisma.resale.findUnique({
    where: { id },
    include: { order: true }
  });

  if (!listing || listing.status !== 'listed') {
    return res.status(404).json({ error: 'Listado no disponible' });
  }
  if (listing.sellerId === req.user!.id) {
    return res.status(400).json({ error: 'No puedes comprar tu propio listado' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: listing.orderId },
      data: {
        userId: req.user!.id,
        buyerName: req.user!.name,
        buyerEmail: req.user!.email,
        status: 'active',
        resoldToUserId: req.user!.id,
        qrCode: randomUUID(),
        qrUsed: false,
        qrUsedAt: null
      }
    });

    return tx.resale.update({
      where: { id: listing.id },
      data: {
        status: 'sold',
        buyerId: req.user!.id,
        soldAt: new Date()
      },
      select: listingSelect()
    });
  });

  res.json(updated);
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const listing = await prisma.resale.findUnique({ where: { id } });

  if (!listing || listing.sellerId !== req.user!.id) {
    return res.status(404).json({ error: 'Listado no encontrado' });
  }
  if (listing.status !== 'listed') {
    return res.status(400).json({ error: 'Este listado ya no se puede cancelar' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.resale.update({
      where: { id },
      data: { status: 'cancelled' }
    });
    await tx.order.update({
      where: { id: listing.orderId },
      data: { status: 'active' }
    });
  });

  res.json({ message: 'Listado cancelado' });
});

export default router;
