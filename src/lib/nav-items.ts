import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Camera,
  Package,
  DollarSign,
  ImageIcon,
} from 'lucide-react';

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/bookings', label: 'Bookings', icon: CalendarDays },
  { to: '/shoots', label: 'Shoots', icon: Camera },
  { to: '/gear', label: 'Gear', icon: Package },
  { to: '/pricing', label: 'Pricing', icon: DollarSign },
  { to: '/galleries', label: 'Galleries', icon: ImageIcon },
];
