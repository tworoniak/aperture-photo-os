import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  status: z.enum(['lead', 'active', 'past']),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
