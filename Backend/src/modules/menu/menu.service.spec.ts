import { NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';

describe('MenuService', () => {
  it('throws when updating a missing item', async () => {
    const service = new MenuService(
      { findOne: jest.fn(async () => null) } as any,
      { findOne: jest.fn(async () => null) } as any,
    );
    await expect(service.update('missing', { name: 'New' })).rejects.toBeInstanceOf(NotFoundException);
  });
});

