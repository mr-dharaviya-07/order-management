import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../database/entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMenuItemDto, MenuQueryDto, UpdateMenuItemDto, CreateCategoryDto } from './dto/menu.dto';
import { MenuService } from './menu.service';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menu: MenuService) {}
  @Get() findAll(@Query() query: MenuQueryDto) { return this.menu.findAll(query); }
  @Get('categories') findCategories() { return this.menu.findCategories(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.menu.findOne(id); }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Post('categories') createCategory(@Body() dto: CreateCategoryDto) { return this.menu.createCategory(dto); }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Post() create(@Body() dto: CreateMenuItemDto) { return this.menu.create(dto); }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateMenuItemDto) { return this.menu.update(id, dto); }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN)
  @Delete(':id') remove(@Param('id') id: string) { return this.menu.remove(id); }
}
