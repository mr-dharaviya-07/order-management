import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '../types';

export interface CartLine { item: MenuItem; quantity: number }
interface CartState {
  lines: CartLine[];
  add: (item: MenuItem) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(persist((set) => ({
  lines: [],
  add: (item) => set((s) => ({ lines: s.lines.some((l) => l.item.id === item.id) ? s.lines.map((l) => l.item.id === item.id ? { ...l, quantity: Math.min(l.quantity + 1, 99) } : l) : [...s.lines, { item, quantity: 1 }] })),
  remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.item.id !== id) })),
  update: (id, quantity) => set((s) => {
    const safeQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
    return { lines: safeQuantity <= 0 ? s.lines.filter((l) => l.item.id !== id) : s.lines.map((l) => l.item.id === id ? { ...l, quantity: Math.min(safeQuantity, 99) } : l) };
  }),
  clear: () => set({ lines: [] }),
}), { name: 'oms-cart' }));

export const getCartTotals = (lines: CartLine[]) => {
  const subtotal = lines.reduce((sum, line) => sum + Number(line.item.price) * line.quantity, 0);
  const deliveryFee = subtotal > 0 ? 3.99 : 0;
  const tax = subtotal * 0.0825;
  return { subtotal, deliveryFee, tax, total: subtotal + deliveryFee + tax };
};
