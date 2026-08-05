import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Enter a full name'),
  phone: z.string().regex(/^[0-9+() -]{7,20}$/, 'Enter a valid phone number'),
  address: z.string().min(5, 'Enter a delivery address'),
  city: z.string().min(2, 'Enter a city'),
  state: z.string().min(2, 'Enter a state'),
  zipCode: z.string().regex(/^[0-9A-Za-z -]{4,10}$/, 'Enter a valid zip code'),
  instructions: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
