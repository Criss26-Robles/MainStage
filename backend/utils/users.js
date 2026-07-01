const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '../data/users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findByEmail(email) {
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

function findById(id) {
  return readUsers().find(u => u.id === id);
}

function createUser({ name, email, passwordHash, role = 'user' }) {
  const users = readUsers();
  const user = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  writeUsers(users);
  return user;
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return { ...safe, role: safe.role || 'user' };
}

module.exports = { findByEmail, findById, createUser, sanitizeUser };
