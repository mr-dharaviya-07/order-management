import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, Matches, Min, ValidateNested } from 'class-validator';
import { OrderStatus } from '../../../database/entities/order.entity';

export class CreateOrderItemDto {
  @IsString()
  menuItemId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString() customerName: string;
  @Matches(/^[0-9+() -]{7,20}$/) phone: string;
  @IsString() address: string;
  @IsString() city: string;
  @IsString() state: string;
  @Matches(/^[0-9A-Za-z -]{4,10}$/) zipCode: string;
  @IsOptional() @IsString() instructions?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}

export class OrderQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
