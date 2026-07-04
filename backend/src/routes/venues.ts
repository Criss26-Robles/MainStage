import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  const venues = await prisma.venue.findMany({ orderBy: { eventCount: 'desc' } });
  res.json(venues);
});

export default router;
