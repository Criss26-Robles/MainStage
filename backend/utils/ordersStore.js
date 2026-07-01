const fs = require('fs');
const path = require('path');

const ORDERS_FILE = path.join(__dirname, '../data/orders.json');

function readOrders() {
  try {
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function getAll() {
  return readOrders();
}

function create(order) {
  const orders = readOrders();
  const id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
  const newOrder = { id, ...order };
  orders.push(newOrder);
  writeOrders(orders);
  return newOrder;
}

function getByUserId(userId) {
  return readOrders().filter(o => o.userId === userId);
}

module.exports = { getAll, create, getByUserId };
