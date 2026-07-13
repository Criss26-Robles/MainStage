export interface TicketTier {
  id: number;
  eventId?: number;
  name: string;
  price: number;
  available: number;
  description: string;
  sortOrder: number;
}

export interface EventItem {
  id: number;
  title: string;
  artist: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  department: string;
  price: number;
  image: string;
  imageFocusX?: number;
  imageFocusY?: number;
  description: string;
  availableTickets: number;
  featured: boolean;
  popular: boolean;
  discount: number;
  serviceFeePercent: number;
  salePhase: string;
  tags: string[];
  createdAt?: string;
  tiers?: TicketTier[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  presaleAccess: boolean;
  createdAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  tierId: number | null;
  tierName: string;
  unitPrice: number;
  serviceFee: number;
  finalUnitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  userId: number;
  eventId: number;
  eventTitle: string;
  eventCity: string;
  eventDate: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  totalPrice: number;
  confirmationCode: string;
  qrCode: string;
  qrUsed: boolean;
  qrUsedAt?: string | null;
  status: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface Venue {
  id: number;
  name: string;
  city: string;
  department: string;
  capacity: number;
  image: string;
  description: string;
  eventCount: number;
}

export interface City {
  name: string;
  department: string;
  count: number;
}

export interface EventFilters {
  artist?: string;
  city?: string;
  category?: string;
  date?: string;
  search?: string;
  featured?: string;
  popular?: string;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface NewOrderItem {
  tierId: number;
  quantity: number;
}

export interface NewOrder {
  eventId: number;
  items: NewOrderItem[];
}

export interface TierInput {
  name: string;
  price: number;
  available: number;
  description?: string;
}

export interface AdminEventPayload {
  title: string;
  artist: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  department: string;
  image?: string;
  imageFocusX?: number;
  imageFocusY?: number;
  description?: string;
  featured?: boolean;
  popular?: boolean;
  discount?: number;
  serviceFeePercent?: number;
  salePhase?: string;
  priceChangeReason?: string;
  tiers: TierInput[];
}

export interface PriceHistoryEntry {
  id: number;
  eventId: number;
  oldPrice: number;
  newPrice: number;
  reason: string;
  changedBy: number | null;
  createdAt: string;
}

export interface PurchaseInfo {
  purchasedQty: number;
  maxAllowed: number;
  remaining: number;
  canPurchasePresale: boolean;
  salePhase: string;
}

export interface TicketVerification {
  valid: boolean;
  used: boolean;
  usedAt?: string | null;
  order: {
    id: number;
    eventTitle: string;
    eventCity?: string;
    eventDate?: string;
    quantity?: number;
    buyerName: string;
    confirmationCode?: string;
  };
}

export interface OrderQrResponse {
  qrCode: string;
  qrImage: string;
  qrUsed: boolean;
  qrUsedAt?: string | null;
}

export interface ResaleListing {
  id: number;
  askPrice: number;
  status: string;
  createdAt: string;
  soldAt?: string | null;
  order: {
    id: number;
    eventTitle: string;
    eventCity: string;
    eventDate: string;
    quantity: number;
    totalPrice: number;
  };
  seller: { id: number; name: string };
}
