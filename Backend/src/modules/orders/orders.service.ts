import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull, Not } from 'typeorm';
import { sanitizeText } from '../common/utils/sanitize';
import { CreateOrderDto, OrderQueryDto } from './dto/order.dto';
import { OrdersGateway } from './orders.gateway';
import { Order, OrderStatus } from '../../database/entities/order.entity';
import { MenuItem } from '../../database/entities/menu-item.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { OrderStatusHistory } from '../../database/entities/order-status-history.entity';

const FLOW: OrderStatus[] = [
  OrderStatus.ORDER_RECEIVED,
  OrderStatus.PREPARING,
  OrderStatus.COOKING,
  OrderStatus.READY,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(MenuItem)
    private readonly menuRepository: Repository<MenuItem>,
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly gateway: OrdersGateway,
  ) {}

  async create(dto: CreateOrderDto) {
    const itemIds = dto.items.map((item) => item.menuItemId);
    const menuItems = await this.menuRepository.find({
      where: { id: In(itemIds), isAvailable: true, deletedAt: IsNull() }
    });
    
    if (menuItems.length !== dto.items.length) throw new BadRequestException('One or more menu items are unavailable');
    
    const subtotal = dto.items.reduce((sum, item) => {
      const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId)!;
      return sum + Number(menuItem.price) * item.quantity;
    }, 0);
    
    const deliveryFee = Number(this.config.get('DELIVERY_FEE', 3.99));
    const tax = subtotal * Number(this.config.get('TAX_RATE', 0.0825));
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const order = queryRunner.manager.create(Order, {
        orderNumber: `FD-${Date.now().toString(36).toUpperCase()}`,
        customerName: dto.customerName.trim(),
        phone: dto.phone,
        address: sanitizeText(dto.address),
        city: dto.city.trim(),
        state: dto.state.trim(),
        zipCode: dto.zipCode.trim(),
        instructions: dto.instructions ? sanitizeText(dto.instructions) : undefined,
        subtotal,
        deliveryFee,
        tax,
        total: subtotal + deliveryFee + tax,
        estimatedDeliveryAt: new Date(Date.now() + 35 * 60_000),
        status: OrderStatus.ORDER_RECEIVED,
      });
      
      const savedOrder = await queryRunner.manager.save(Order, order);
      
      const orderItems = dto.items.map((item) => {
        const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId)!;
        return queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          lineTotal: Number(menuItem.price) * item.quantity,
        });
      });
      
      await queryRunner.manager.save(OrderItem, orderItems);
      
      const statusHistory = queryRunner.manager.create(OrderStatusHistory, {
        orderId: savedOrder.id,
        status: OrderStatus.ORDER_RECEIVED,
        note: 'Order received by kitchen',
      });
      
      await queryRunner.manager.save(OrderStatusHistory, statusHistory);
      
      await queryRunner.commitTransaction();
      
      const fullOrder = await this.findOne(savedOrder.id);
      this.gateway.emitOrder(fullOrder);
      return fullOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: OrderQueryDto) {
    const where: any = { deletedAt: IsNull() };
    if (query.status) {
      where.status = query.status as OrderStatus;
    }
    
    let orders = await this.orderRepository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['items', 'items.menuItem', 'statusHistory'],
    });
    
    if (query.search) {
      const search = query.search.toLowerCase();
      orders = orders.filter(order => 
        `${order.orderNumber} ${order.customerName} ${order.phone}`.toLowerCase().includes(search)
      );
    }
    
    return orders;
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: [
        { id, deletedAt: IsNull() },
        { orderNumber: id, deletedAt: IsNull() },
      ],
      relations: ['items', 'items.menuItem', 'statusHistory'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus, note = 'Status updated') {
    const order = await this.findOne(id);
    
    if (order.status === status) {
      return order;
    }

    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot change status of a completed or cancelled order');
    }
    
    const history = this.dataSource.getRepository(OrderStatusHistory).create({
      orderId: order.id,
      status,
      note,
    });
    await this.dataSource.getRepository(OrderStatusHistory).save(history);
    
    await this.orderRepository.update(order.id, { status });
    
    const updated = await this.findOne(order.id);
    this.gateway.emitOrder(updated);
    return updated;
  }

  async cancel(id: string) {
    return this.updateStatus(id, OrderStatus.CANCELLED, 'Order cancelled');
  }

}

