import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(favorites.map((favorite) => favorite.event));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los eventos guardados' });
  }
});

router.get('/ids', async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      select: { eventId: true }
    });

    res.json(favorites.map((favorite) => favorite.eventId));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudieron cargar los favoritos' });
  }
});

router.post('/:eventId', async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ error: 'Evento invalido' });
  }

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_eventId: {
          userId: req.user!.id,
          eventId
        }
      },
      update: {},
      create: {
        userId: req.user!.id,
        eventId
      },
      include: { event: true }
    });

    res.status(201).json(favorite.event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo guardar el evento' });
  }
});

router.delete('/:eventId', async (req, res) => {
  const eventId = Number(req.params.eventId);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    return res.status(400).json({ error: 'Evento invalido' });
  }

  try {
    await prisma.favorite.deleteMany({
      where: {
        userId: req.user!.id,
        eventId
      }
    });

    res.json({ message: 'Evento eliminado de guardados' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo quitar el evento guardado' });
  }
});

export default router;
