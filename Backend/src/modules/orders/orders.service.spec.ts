import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../../database/entities/order.entity';

describe('OrdersService', () => {
  describe('create', () => {
    it('throws BadRequestException if items are unavailable', async () => {
      const service = new OrdersService(
        null as any,
        { find: jest.fn(async () => []) } as any,
        null as any,
        { get: jest.fn((key) => (key === 'TAX_RATE' ? 0.1 : 5)) } as unknown as ConfigService,
        { emitOrder: jest.fn() } as any,
      );
      await expect(service.create({ customerName: 'Test', items: [{ menuItemId: 'menu-1', quantity: 2 }] } as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('throws NotFoundException for missing order', async () => {
      const service = new OrdersService(
        { findOne: jest.fn(async () => null) } as any,
        null as any,
        null as any,
        { get: jest.fn() } as any,
        { emitOrder: jest.fn() } as any,
      );
      await expect(service.updateStatus('order-404', OrderStatus.COOKING)).rejects.toThrow(NotFoundException);
    });
  });
});

