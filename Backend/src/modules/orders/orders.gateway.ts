import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Order } from '../../database/entities/order.entity';

@WebSocketGateway({ cors: { origin: '*' } })
export class OrdersGateway {
  @WebSocketServer()
  server: Server;

  emitOrder(order: Order) {
    this.server.emit('order.updated', order);
    this.server.to(`order:${order.id}`).emit('order.updated', order);
  }
}
