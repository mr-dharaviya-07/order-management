import { describe, expect, it } from 'vitest';
import { checkoutSchema } from './checkout.schema';

describe('checkoutSchema', () => {
  it('rejects invalid checkout data', () => {
    expect(checkoutSchema.safeParse({ customerName: '', phone: 'x', address: '', city: '', state: '', zipCode: '!' }).success).toBe(false);
  });

  it('accepts a valid checkout', () => {
    expect(checkoutSchema.safeParse({ customerName: 'Ravi Patel', phone: '9876543210', address: '1 Main Street', city: 'Ahmedabad', state: 'GJ', zipCode: '380001' }).success).toBe(true);
  });
});
