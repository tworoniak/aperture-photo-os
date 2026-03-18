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
  status: 'lead' | 'active' | 'past';
  createdAt: string;
  lastContact?: string;
  totalShoots: number;
  totalRevenue: number;
}

// Bookings
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  clientName: string;
  clientId?: string;
  sessionType: string;
  date: string;
  time?: string;
  location?: string;
  status: BookingStatus;
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  contractSigned: boolean;
  shootId?: string;
  notes?: string;
}

// Shoots / Planner
export interface ShotItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MoodBoardImage {
  id: string;
  url: string;
  caption?: string;
}

export interface Shoot {
  id: string;
  title: string;
  clientName?: string;
  bookingId?: string;
  date: string;
  location?: string;
  locationNotes?: string;
  status: 'planning' | 'ready' | 'completed';
  completedAt?: string;
  shotList: ShotItem[];
  moodBoard: MoodBoardImage[];
  gearKitIds: string[];
  isStandalone: boolean;
  notes?: string;
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
export interface PricingAddOn {
  id: string;
  label: string;
  price: number;
  description?: string;
}

export interface PricingPackage {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  includes: string[];
  addOns: PricingAddOn[];
  popular?: boolean;
}

export interface QuoteLineItem {
  id: string;
  label: string;
  amount: number;
  type: 'package' | 'addon' | 'custom' | 'discount';
}

export interface Quote {
  id: string;
  clientName: string;
  packageId?: string;
  lineItems: QuoteLineItem[];
  discountCode?: string;
  discountAmount: number;
  notes?: string;
  createdAt: string;
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
  clientId?: string;
  shootId?: string;
  title: string;
  photos: ProofPhoto[];
  expiresAt?: string;
  publicToken?: string;
}
