import type { BookingStatus } from '@/types';

export const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  completed: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const SESSION_TYPE_COLORS: Record<string, string> = {
  Wedding: 'bg-pink-500/15 text-pink-700 border-pink-500/20',
  Engagement: 'bg-purple-500/15 text-purple-700 border-purple-500/20',
  Portrait: 'bg-blue-500/15 text-blue-700 border-blue-500/20',
  Family: 'bg-teal-500/15 text-teal-700 border-teal-500/20',
  Newborn: 'bg-amber-500/15 text-amber-700 border-amber-500/20',
  Maternity: 'bg-orange-500/15 text-orange-700 border-orange-500/20',
  Headshots: 'bg-gray-500/15 text-gray-700 border-gray-500/20',
  Event: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/20',
  Commercial: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/20',
  Other: 'bg-muted text-muted-foreground border-border',
};
