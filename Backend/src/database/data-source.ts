import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { ImageAsset } from './entities/image-asset.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
declare const require: any;
declare const process: any;
declare const __dirname: string;
const dotenv = require('dotenv');
const path = require('path');

// Load .env relative to this file
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'order_management',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Category,
    MenuItem,
    ImageAsset,
    Order,
    OrderItem,
    OrderStatusHistory,
  ],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  subscribers: [],
});
