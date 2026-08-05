import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Order, OrderStatus } from '../../database/entities/order.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async stats() {
    const orders = await this.orderRepository.find({ where: { deletedAt: IsNull() } });
    const revenue = orders.filter((order) => order.status === OrderStatus.DELIVERED).reduce((sum, order) => sum + Number(order.total), 0);
    const byStatus = Object.values(OrderStatus).map((status) => ({ status, count: orders.filter((order) => order.status === status).length }));
    const revenueSeries = orders.reduce<Record<string, number>>((series, order) => {
      const day = order.createdAt.toISOString().slice(0, 10);
      series[day] = (series[day] ?? 0) + Number(order.total);
      return series;
    }, {});
    const inactiveStatuses: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.CANCELLED];
    return {
      totalOrders: orders.length,
      revenue,
      pendingOrders: orders.filter((order) => !inactiveStatuses.includes(order.status)).length,
      completedOrders: orders.filter((order) => order.status === OrderStatus.DELIVERED).length,
      byStatus,
      revenueSeries: Object.entries(revenueSeries).map(([date, total]) => ({ date, total })),
    };
  }
}

