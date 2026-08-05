import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrdersController } from '../src/modules/orders/orders.controller';
import { OrdersService } from '../src/modules/orders/orders.service';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  const orders = { create: jest.fn((dto) => ({ id: 'order-1', ...dto })), findAll: jest.fn(() => []), findOne: jest.fn(), updateStatus: jest.fn(), cancel: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [OrdersController], providers: [{ provide: OrdersService, useValue: orders }] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => app.close());

  it('validates checkout payloads', () => request(app.getHttpServer()).post('/orders').send({ items: [] }).expect(400));
});
