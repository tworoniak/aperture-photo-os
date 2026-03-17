// User & Auth
export type UserRole = 'admin' | 'client';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

// Clients / CRM
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  createdAt: string;
  totalShoots: number;
  totalRevenue: number;
  status: 'lead' | 'active' | 'past';
}

// Bookings
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  sessionType: string;
  date: string;
  location?: string;
  status: BookingStatus;
  depositPaid: boolean;
  totalAmount: number;
  notes?: string;
}

// Shoots / Planner
export interface Shoot {
  id: string;
  bookingId: string;
  clientName: string;
  date: string;
  shotList: string[];
  moodBoardUrls: string[];
  locationNotes?: string;
  gearKitIds: string[];
  status: 'planning' | 'ready' | 'completed';
}

// Gear
export type GearCategory = 'body' | 'lens' | 'lighting' | 'accessory' | 'bag';

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  serialNumber?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  insuranceValue?: number;
  notes?: string;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
}

// Pricing
export interface PricingPackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  includes: string[];
  addOns: PricingAddOn[];
}

export interface PricingAddOn {
  id: string;
  label: string;
  price: number;
}

// Gallery / Proofing
export type PhotoStatus = 'unreviewed' | 'approved' | 'rejected' | 'favourite';

export interface ProofPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  status: PhotoStatus;
  clientComment?: string;
}

export interface Gallery {
  id: string;
  clientId: string;
  shootId: string;
  title: string;
  photos: ProofPhoto[];
  expiresAt?: string;
  publicToken?: string;
}
