import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

function normalizeEventId(value: string) {
  const eventId = Number(value);
  return Number.isInteger(eventId) && eventId > 0 ? eventId : null;
}

function normalizeRating(value: unknown) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

router.get('/event/:eventId', async (req, res) => {
  const eventId = normalizeEventId(req.params.eventId);
  if (!eventId) return res.status(400).json({ error: 'Evento invalido' });

  try {
    const reviews = await prisma.review.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const averageRating = reviews.length
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
      : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar las opiniones' });
  }
});

router.post('/event/:eventId', authMiddleware, async (req, res) => {
  const eventId = normalizeEventId(req.params.eventId);
  const rating = normalizeRating(req.body?.rating);
  const comment = String(req.body?.comment ?? '').trim();

  if (!eventId) return res.status(400).json({ error: 'Evento invalido' });
  if (!rating) return res.status(400).json({ error: 'La calificacion debe estar entre 1 y 5' });
  if (comment.length < 5) {
    return res.status(400).json({ error: 'El comentario debe tener al menos 5 caracteres' });
  }
  if (comment.length > 500) {
    return res.status(400).json({ error: 'El comentario no puede superar 500 caracteres' });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const review = await prisma.review.upsert({
      where: {
        userId_eventId: {
          userId: req.user!.id,
          eventId
        }
      },
      update: {
        rating,
        comment
      },
      create: {
        userId: req.user!.id,
        eventId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo guardar la opinion' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Opinion invalida' });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ error: 'Opinion no encontrada' });

    const canDelete = review.userId === req.user!.id || req.user!.role === 'admin';
    if (!canDelete) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta opinion' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Opinion eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo eliminar la opinion' });
  }
});

export default router;
