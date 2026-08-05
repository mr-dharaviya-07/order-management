import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from './orders.gateway';
import { OrdersService } from './orders.service';

@Module({ imports: [], controllers: [OrdersController], providers: [OrdersService, OrdersGateway], exports: [OrdersService] })
export class OrdersModule {}
