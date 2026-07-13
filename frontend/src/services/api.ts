import type {
  AdminEventPayload,
  AuthResponse,
  City,
  EventFilters,
  EventItem,
  NewOrder,
  Order,
  PurchaseInfo,
  User,
  Venue,
  TicketVerification,
  OrderQrResponse,
  PriceHistoryEntry,
  ResaleListing
} from '../types';

const API_BASE = '/api';
const TOKEN_KEY = 'mainstage_token';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse<AuthResponse>(res);
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse<AuthResponse>(res);
}

export async function fetchMe(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: authHeaders()
  });
  return handleResponse<User>(res);
}

export async function fetchVenues(): Promise<Venue[]> {
  const res = await fetch(`${API_BASE}/venues`);
  if (!res.ok) throw new Error('Error al cargar escenarios');
  return res.json();
}

export function getDiscountedPrice(price: number, discount = 0): number {
  if (price === 0) return 0;
  if (!discount) return price;
  return Math.round(price * (1 - discount / 100));
}

export function getServiceFee(unitPrice: number, serviceFeePercent = 0): number {
  if (unitPrice === 0) return 0;
  return Math.round(unitPrice * (serviceFeePercent / 100));
}

export function getFinalPrice(price: number, discount = 0, serviceFeePercent = 0): number {
  const unitPrice = getDiscountedPrice(price, discount);
  return unitPrice + getServiceFee(unitPrice, serviceFeePercent);
}

export async function fetchPurchaseInfo(eventId: string | number): Promise<PurchaseInfo> {
  const res = await fetch(`${API_BASE}/events/${eventId}/purchase-info`, {
    headers: authHeaders()
  });
  return handleResponse<PurchaseInfo>(res);
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders/my`, {
    headers: authHeaders()
  });
  return handleResponse<Order[]>(res);
}

export async function fetchEvents(params: EventFilters = {}): Promise<EventItem[]> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const url = `${API_BASE}/events${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error al cargar eventos');
  return res.json();
}

export async function fetchEvent(id: string | number): Promise<EventItem> {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('Evento no encontrado');
  return res.json();
}

export async function fetchPriceHistory(eventId: string | number): Promise<PriceHistoryEntry[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/price-history`);
  if (!res.ok) throw new Error('No se pudo cargar el historial de precios');
  return res.json();
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/events/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${API_BASE}/events/cities`);
  if (!res.ok) throw new Error('Error al cargar ciudades');
  return res.json();
}

export async function createOrder(orderData: NewOrder): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(orderData)
  });
  return handleResponse<Order>(res);
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    currencyDisplay: 'code',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short'
  }).format(date);
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
  return handleResponse<AdminStats>(res);
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/admin/orders`, { headers: authHeaders() });
  return handleResponse<Order[]>(res);
}

export async function fetchAdminEvents(): Promise<EventItem[]> {
  const res = await fetch(`${API_BASE}/admin/events`, { headers: authHeaders() });
  return handleResponse<EventItem[]>(res);
}

export async function createAdminEvent(data: AdminEventPayload): Promise<EventItem> {
  const res = await fetch(`${API_BASE}/admin/events`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse<EventItem>(res);
}

export async function updateAdminEvent(
  id: string | number,
  data: AdminEventPayload
): Promise<EventItem> {
  const res = await fetch(`${API_BASE}/admin/events/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse<EventItem>(res);
}

export async function deleteAdminEvent(id: string | number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/admin/events/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse<{ message: string }>(res);
}

export async function fetchAdminUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
  return handleResponse<User[]>(res);
}

export async function toggleUserPresaleAccess(
  userId: number,
  presaleAccess?: boolean
): Promise<User> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/presale`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(presaleAccess !== undefined ? { presaleAccess } : {})
  });
  return handleResponse<User>(res);
}

export async function fetchOrderQr(orderId: number): Promise<OrderQrResponse> {
  const res = await fetch(`${API_BASE}/tickets/my/${orderId}/qr`, {
    headers: authHeaders()
  });
  return handleResponse<OrderQrResponse>(res);
}

export async function verifyTicket(code: string): Promise<TicketVerification> {
  const res = await fetch(`${API_BASE}/tickets/verify/${encodeURIComponent(code)}`);
  return handleResponse<TicketVerification>(res);
}

export async function markTicketUsed(code: string): Promise<TicketVerification & { message: string }> {
  const res = await fetch(`${API_BASE}/tickets/verify/${encodeURIComponent(code)}/use`, {
    method: 'POST',
    headers: authHeaders()
  });
  return handleResponse<TicketVerification & { message: string }>(res);
}

export async function fetchResaleListings(): Promise<ResaleListing[]> {
  const res = await fetch(`${API_BASE}/resale`);
  if (!res.ok) throw new Error('Error al cargar reventas');
  return res.json();
}

export async function fetchMyResaleListings(): Promise<ResaleListing[]> {
  const res = await fetch(`${API_BASE}/resale/my`, { headers: authHeaders() });
  return handleResponse<ResaleListing[]>(res);
}

export async function createResaleListing(orderId: number, askPrice: number): Promise<ResaleListing> {
  const res = await fetch(`${API_BASE}/resale`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ orderId, askPrice })
  });
  return handleResponse<ResaleListing>(res);
}

export async function buyResaleListing(id: number): Promise<ResaleListing> {
  const res = await fetch(`${API_BASE}/resale/${id}/buy`, {
    method: 'POST',
    headers: authHeaders()
  });
  return handleResponse<ResaleListing>(res);
}

export async function cancelResaleListing(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/resale/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse<{ message: string }>(res);
}

export interface AdminStatsTopEvent {
  eventTitle: string;
  tickets: number;
  revenue: number;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalTickets: number;
  totalEvents: number;
  recentOrders: Order[];
  topEvents: AdminStatsTopEvent[];
}
