import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FoodCard } from './FoodCard';
import type { MenuItem } from '../../types';

const item = { id: 'm1', price: '10.00', name: 'Pizza', categoryId: 'c1', category: { id: 'c1', name: 'Pizza', slug: 'pizza' }, slug: 'pizza', description: 'Fresh mozzarella pizza', imageUrl: 'https://example.com/pizza.jpg', isAvailable: true } satisfies MenuItem;

describe('FoodCard', () => {
  it('renders food details and handles add', async () => {
    const onAdd = vi.fn();
    render(<FoodCard item={item} onAdd={onAdd} onDetails={vi.fn()} />);
    expect(screen.getAllByText('Pizza')[0]).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /add to c/i }));
    expect(onAdd).toHaveBeenCalled();
  });
});
