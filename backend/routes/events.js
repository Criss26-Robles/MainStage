const express = require('express');
const eventsStore = require('../utils/eventsStore');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, featured, search, city, artist, date, dateFrom, dateTo, month } = req.query;
  let filtered = [...eventsStore.getAll()];

  if (category) {
    filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }
  if (city) {
    filtered = filtered.filter(e => e.city.toLowerCase() === city.toLowerCase());
  }
  if (featured === 'true') {
    filtered = filtered.filter(e => e.featured);
  }
  if (req.query.popular === 'true') {
    filtered = filtered.filter(e => e.popular);
  }
  if (artist) {
    const q = artist.toLowerCase();
    filtered = filtered.filter(e => e.artist.toLowerCase().includes(q));
  }
  if (date) {
    filtered = filtered.filter(e => e.date === date);
  }
  if (month) {
    filtered = filtered.filter(e => e.date.startsWith(month));
  }
  if (dateFrom) {
    filtered = filtered.filter(e => e.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter(e => e.date <= dateTo);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.artist.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => a.date.localeCompare(b.date));
  res.json(filtered);
});

router.get('/categories', (_req, res) => {
  const categories = [...new Set(eventsStore.getAll().map(e => e.category))];
  res.json(categories);
});

router.get('/cities', (_req, res) => {
  const cityMap = {};
  eventsStore.getAll().forEach(e => {
    if (!cityMap[e.city]) {
      cityMap[e.city] = { name: e.city, department: e.department, count: 0 };
    }
    cityMap[e.city].count++;
  });
  res.json(Object.values(cityMap).sort((a, b) => b.count - a.count));
});

router.get('/:id', (req, res) => {
  const event = eventsStore.findById(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(event);
});

module.exports = router;
