const API_BASE = '/api';
const TOKEN_KEY = 'mainstage_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function authHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function register(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(res);
}

export async function fetchMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders()
  });
  return handleResponse(res);
}

export async function fetchVenues() {
  const res = await fetch(`${API_BASE}/venues`);
  if (!res.ok) throw new Error('Error al cargar escenarios');
  return res.json();
}

export function getDiscountedPrice(price, discount = 0) {
  if (price === 0) return 0;
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

export async function fetchMyOrders() {
  const res = await fetch(`${API_BASE}/orders/my`, {
    headers: authHeaders()
  });
  return handleResponse(res);
}

export async function fetchEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/events${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return res.json();
}

export async function fetchEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Evento no encontrado');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/events/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function fetchCities() {
  const res = await fetch(`${API_BASE}/events/cities`);
  if (!res.ok) throw new Error('Error al cargar ciudades');
  return res.json();
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData)
  });
  return handleResponse(res);
}

export function formatPrice(price) {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(price);
}

export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatShortDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchAdminOrders() {
  const res = await fetch(`${API_BASE}/admin/orders`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function fetchAdminEvents() {
  const res = await fetch(`${API_BASE}/admin/events`, { headers: authHeaders() });
  return handleResponse(res);
}

export async function createAdminEvent(data) {
  const res = await fetch(`${API_BASE}/admin/events`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function updateAdminEvent(id, data) {
  const res = await fetch(`${API_BASE}/admin/events/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function deleteAdminEvent(id) {
  const res = await fetch(`${API_BASE}/admin/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse(res);
}
