import { IsBoolean, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() sort?: 'name' | 'priceAsc' | 'priceDesc';
}

export class CreateMenuItemDto {
  @IsString() categoryId: string;
  @IsString() name: string;
  @IsString() description: string;
  @Type(() => Number) @IsNumber() @Min(0) price: number;
  @IsUrl({ require_tld: false }) imageUrl: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
}

export class UpdateMenuItemDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsUrl({ require_tld: false }) imageUrl?: string;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
}
