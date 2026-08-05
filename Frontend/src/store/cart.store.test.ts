import { describe, expect, it } from 'vitest';
import { getCartTotals } from './cart.store';
import type { MenuItem } from '../types';

const item = { id: 'm1', price: '10.00', name: 'Pizza', categoryId: 'c1', category: { id: 'c1', name: 'Pizza', slug: 'pizza' }, slug: 'pizza', description: 'Fresh', imageUrl: '', isAvailable: true } satisfies MenuItem;

describe('getCartTotals', () => {
  it('calculates subtotal, delivery, tax and total', () => {
    const totals = getCartTotals([{ item, quantity: 2 }]);
    expect(totals.subtotal).toBe(20);
    expect(totals.deliveryFee).toBe(3.99);
    expect(totals.tax).toBeCloseTo(1.65);
    expect(totals.total).toBeCloseTo(25.64);
  });
});
