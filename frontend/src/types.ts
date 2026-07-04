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
  description: string;
  availableTickets: number;
  featured: boolean;
  popular: boolean;
  discount: number;
  tags: string[];
  createdAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
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

export interface NewOrder {
  eventId: number;
  quantity: number;
}
