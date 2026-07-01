const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const eventsRouter = require('./routes/events');
const ordersRouter = require('./routes/orders');
const authRouter = require('./routes/auth');
const venuesRouter = require('./routes/venues');
const adminRouter = require('./routes/admin');
const { findByEmail, createUser } = require('./utils/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

async function seedAdmin() {
  if (!findByEmail('admin@mainstage.co')) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    createUser({
      name: 'Administrador',
      email: 'admin@mainstage.co',
      passwordHash,
      role: 'admin'
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
app.use('/api/admin', adminRouter);

seedAdmin().then(() => {
  app.listen(PORT, () => {
    console.log(`MainStage API corriendo en http://localhost:${PORT}`);
  });
});
