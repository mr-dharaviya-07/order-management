import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseSeedService } from './database-seed.service';
import { User } from '../../database/entities/user.entity';
import { Category } from '../../database/entities/category.entity';
import { MenuItem } from '../../database/entities/menu-item.entity';
import { ImageAsset } from '../../database/entities/image-asset.entity';
import { Order } from '../../database/entities/order.entity';
import { OrderItem } from '../../database/entities/order-item.entity';
import { OrderStatusHistory } from '../../database/entities/order-status-history.entity';

const entities = [
  User,
  Category,
  MenuItem,
  ImageAsset,
  Order,
  OrderItem,
  OrderStatusHistory,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: Number(config.get('DB_PORT')) || 3306,
        username: config.get<string>('DB_USERNAME') || 'root',
        password: config.get<string>('DB_PASSWORD') || '',
        database: config.get<string>('DB_DATABASE') || 'order_management',
        entities,
        synchronize: false,
        logging: ['error'],
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  providers: [DatabaseSeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

