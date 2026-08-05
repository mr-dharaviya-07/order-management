import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../database/entities/user.entity';
import { Category } from '../../database/entities/category.entity';
import { MenuItem } from '../../database/entities/menu-item.entity';

const categories = [
  { id: 'cat-pizza', name: 'Pizza', slug: 'pizza', description: 'Wood-fired and classic pizzas' },
  { id: 'cat-burger', name: 'Burgers', slug: 'burgers', description: 'Stacked burgers and fries' },
  { id: 'cat-salad', name: 'Salads', slug: 'salads', description: 'Fresh bowls and greens' },
  { id: 'cat-dessert', name: 'Desserts', slug: 'desserts', description: 'Sweet finishes' },
];

const menu = [
  { id: 'menu-margherita', categoryId: 'cat-pizza', name: 'Margherita Pizza', slug: 'margherita-pizza', description: 'San Marzano tomato, mozzarella, basil and olive oil.', price: 13.99, imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80', isAvailable: true },
  { id: 'menu-pepperoni', categoryId: 'cat-pizza', name: 'Pepperoni Storm', slug: 'pepperoni-storm', description: 'Crisp pepperoni, mozzarella, oregano and chili honey.', price: 15.49, imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=900&q=80', isAvailable: true },
  { id: 'menu-burger', categoryId: 'cat-burger', name: 'Smash Burger', slug: 'smash-burger', description: 'Double beef patty, sharp cheddar, pickles and house sauce.', price: 12.50, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80', isAvailable: true },
  { id: 'menu-caesar', categoryId: 'cat-salad', name: 'Chicken Caesar', slug: 'chicken-caesar', description: 'Romaine, grilled chicken, parmesan, croutons and Caesar dressing.', price: 11.25, imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=900&q=80', isAvailable: true },
  { id: 'menu-brownie', categoryId: 'cat-dessert', name: 'Sea Salt Brownie', slug: 'sea-salt-brownie', description: 'Warm chocolate brownie, sea salt and vanilla cream.', price: 7.25, imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80', isAvailable: true },
];

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
  ) {}

  async onModuleInit() {
    const admin = await this.userRepository.findOne({ where: { email: 'admin@example.com' } });
    if (!admin) {
      const adminUser = this.userRepository.create({
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('Password123!', 12),
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(adminUser);
    }
    
    for (const category of categories) {
      const exists = await this.categoryRepository.findOne({ where: { id: category.id } });
      if (!exists) {
        const cat = this.categoryRepository.create(category);
        await this.categoryRepository.save(cat);
      }
    }
    
    for (const item of menu) {
      const exists = await this.menuItemRepository.findOne({ where: { id: item.id } });
      if (!exists) {
        const menuItem = this.menuItemRepository.create({
          ...item,
          price: item.price,
        });
        await this.menuItemRepository.save(menuItem);
      }
    }
  }
}

