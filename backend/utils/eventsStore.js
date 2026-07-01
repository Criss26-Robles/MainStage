const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, '../data/events.json');

function readEvents() {
  try {
    const data = fs.readFileSync(EVENTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
}

function getAll() {
  return readEvents();
}

function findById(id) {
  return readEvents().find(e => e.id === parseInt(id));
}

function create(eventData) {
  const events = readEvents();
  const id = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const event = { id, ...eventData };
  events.push(event);
  writeEvents(events);
  return event;
}

function update(id, eventData) {
  const events = readEvents();
  const index = events.findIndex(e => e.id === parseInt(id));
  if (index === -1) return null;
  events[index] = { ...events[index], ...eventData, id: parseInt(id) };
  writeEvents(events);
  return events[index];
}

function remove(id) {
  const events = readEvents();
  const index = events.findIndex(e => e.id === parseInt(id));
  if (index === -1) return false;
  events.splice(index, 1);
  writeEvents(events);
  return true;
}

module.exports = { getAll, findById, create, update, remove };
