import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { generateQrDataUrl } from '../lib/tickets';

const router = Router();

router.get('/verify/:code', async (req, res) => {
  const code = req.params.code.trim();
  if (!code) return res.status(400).json({ error: 'Código requerido' });

  const order = await prisma.order.findUnique({ where: { qrCode: code } });
  if (!order) return res.status(404).json({ error: 'Boleto no encontrado' });

  res.json({
    valid: true,
    used: order.qrUsed,
    usedAt: order.qrUsedAt,
    order: {
      id: order.id,
      eventTitle: order.eventTitle,
      eventCity: order.eventCity,
      eventDate: order.eventDate,
      quantity: order.quantity,
      buyerName: order.buyerName,
      confirmationCode: order.confirmationCode
    }
  });
});

router.post('/verify/:code/use', authMiddleware, adminMiddleware, async (req, res) => {
  const code = req.params.code.trim();
  const order = await prisma.order.findUnique({ where: { qrCode: code } });
  if (!order) return res.status(404).json({ error: 'Boleto no encontrado' });

  if (order.qrUsed) {
    return res.json({
      message: 'Este boleto ya fue utilizado',
      used: true,
      usedAt: order.qrUsedAt,
      order: {
        id: order.id,
        eventTitle: order.eventTitle,
        buyerName: order.buyerName
      }
    });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { qrUsed: true, qrUsedAt: new Date() }
  });

  res.json({
    message: 'Boleto marcado como usado',
    used: true,
    usedAt: updated.qrUsedAt,
    order: {
      id: updated.id,
      eventTitle: updated.eventTitle,
      buyerName: updated.buyerName
    }
  });
});

router.get('/my/:orderId/qr', authMiddleware, async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Orden no encontrada' });
  }

  const qrImage = await generateQrDataUrl(order.qrCode);
  res.json({
    qrCode: order.qrCode,
    qrImage,
    qrUsed: order.qrUsed,
    qrUsedAt: order.qrUsedAt
  });
});

export default router;
