const express = require('express');
const venues = require('../data/venues');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json(venues.sort((a, b) => b.eventCount - a.eventCount));
});

module.exports = router;
