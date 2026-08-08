import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { sanitizeText } from '../common/utils/sanitize';
import { CreateMenuItemDto, MenuQueryDto, UpdateMenuItemDto, CreateCategoryDto } from './dto/menu.dto';
import { MenuItem } from '../../database/entities/menu-item.entity';
import { Category } from '../../database/entities/category.entity';

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepository: Repository<MenuItem>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(query: MenuQueryDto) {
    const qb = this.menuRepository.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.images', 'images')
      .where('item.deletedAt IS NULL');

    if (query.search) {
      qb.andWhere('(item.name LIKE :search OR item.description LIKE :search)', { search: `%${query.search}%` });
    }

    if (query.category) {
      qb.andWhere('(category.slug = :category OR category.id = :category)', { category: query.category });
    }

    if (query.sort === 'priceAsc') {
      qb.orderBy('item.price', 'ASC');
    } else if (query.sort === 'priceDesc') {
      qb.orderBy('item.price', 'DESC');
    } else {
      qb.orderBy('item.name', 'ASC');
    }

    return qb.getMany();
  }

  async findOne(id: string) {
    const item = await this.menuRepository.findOne({
      where: [
        { id, deletedAt: IsNull() },
        { slug: id, deletedAt: IsNull() },
      ],
      relations: ['category', 'images'],
    });
    if (!item) throw new NotFoundException('Menu item not found');
    return item;
  }

  async create(dto: CreateMenuItemDto) {
    await this.ensureCategory(dto.categoryId);
    const slug = slugify(dto.name);
    const item = this.menuRepository.create({
      ...dto,
      slug,
      description: sanitizeText(dto.description)
    });
    await this.menuRepository.save(item);
    return this.findOne(item.id);
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    const item = await this.findOne(id);
    if (dto.categoryId) await this.ensureCategory(dto.categoryId);
    
    const updateData: Partial<MenuItem> = {
      ...dto,
      slug: dto.name ? slugify(dto.name) : undefined,
      description: dto.description ? sanitizeText(dto.description) : undefined,
    };
    
    await this.menuRepository.update(item.id, updateData);
    return this.findOne(item.id);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    await this.menuRepository.update(item.id, { deletedAt: new Date(), isAvailable: false });
    return { ok: true };
  }

  async findCategories() {
    return this.categoryRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = slugify(dto.name);
    const existing = await this.categoryRepository.findOne({
      where: [{ name: dto.name }, { slug }],
    });
    if (existing) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = this.categoryRepository.create({
      id: `cat-${slug}`,
      name: dto.name,
      slug,
      description: dto.description || '',
    });
    return this.categoryRepository.save(category);
  }

  private async ensureCategory(id: string) {
    const exists = await this.categoryRepository.findOne({ where: { id } });
    if (!exists) throw new NotFoundException('Category not found');
  }
}

