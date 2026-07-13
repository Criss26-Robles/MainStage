import 'dotenv/config';
import './types';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';
import authRouter from './routes/auth';
import eventsRouter from './routes/events';
import ordersRouter from './routes/orders';
import venuesRouter from './routes/venues';
import adminRouter from './routes/admin';
import ticketsRouter from './routes/tickets';
import resaleRouter from './routes/resale';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@mainstage.co' } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@mainstage.co',
        password: passwordHash,
        role: 'admin'
      }
    });
    console.log('Usuario admin creado: admin@mainstage.co / admin123');
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', country: 'Colombia', app: 'MainStage' });
});

app.use('/api/venues', venuesRouter);
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/resale', resaleRouter);
app.use('/api/admin', adminRouter);

seedAdmin()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MainStage API corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  });
