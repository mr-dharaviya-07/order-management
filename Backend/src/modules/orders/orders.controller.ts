import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../../database/entities/user.entity';
import { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from './dto/order.dto';
import { OrdersService } from './orders.service';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Post() create(@Body() dto: CreateOrderDto) { return this.orders.create(dto); }
  @Get() findAll(@Query() query: OrderQueryDto) { return this.orders.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.orders.findOne(id); }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Patch(':id/status') updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) { return this.orders.updateStatus(id, dto.status, 'Admin update'); }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Delete(':id') cancel(@Param('id') id: string) { return this.orders.cancel(id); }
}
