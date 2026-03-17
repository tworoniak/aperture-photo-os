import { z } from 'zod';

export const SESSION_TYPES = [
  'Wedding',
  'Engagement',
  'Portrait',
  'Family',
  'Newborn',
  'Maternity',
  'Headshots',
  'Event',
  'Commercial',
  'Other',
] as const;

export const bookingSchema = z.object({
  clientName: z.string().min(2, 'Client name is required'),
  clientId: z.string().optional(),
  sessionType: z.string().min(1, 'Session type is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  totalAmount: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0),
  depositPaid: z.boolean(),
  contractSigned: z.boolean(),
  shootId: z.string().optional(),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
