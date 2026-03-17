import { z } from 'zod';

export const shootSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  isStandalone: z.boolean(),
  clientName: z.string().optional(),
  bookingId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  location: z.string().optional(),
  locationNotes: z.string().optional(),
  status: z.enum(['planning', 'ready', 'completed']),
  notes: z.string().optional(),
});

export type ShootFormValues = z.infer<typeof shootSchema>;
