import { z } from 'zod';

export const gearSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  category: z.enum(['body', 'lens', 'lighting', 'accessory', 'bag']),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().min(0).optional(),
  insuranceValue: z.coerce.number().min(0).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'needs-repair']),
  notes: z.string().optional(),
});

export type GearFormValues = z.infer<typeof gearSchema>;
