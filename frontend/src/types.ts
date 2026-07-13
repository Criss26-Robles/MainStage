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
  tiers: TierInput[];
}

export interface PurchaseInfo {
  purchasedQty: number;
  maxAllowed: number;
  remaining: number;
  canPurchasePresale: boolean;
  salePhase: string;
}
