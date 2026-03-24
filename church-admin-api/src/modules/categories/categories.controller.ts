import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CurrentChurch } from '../../common/decorators/current-church.decorator';
import { CategoriesService } from './categories.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  ReorderCategoryDto,
  BulkCategoryActionDto,
} from './dto/category.dto';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Category> {
    return this.categoriesService.create(churchId, createCategoryDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with filters' })
  async findAll(
    @Query() queryDto: CategoryQueryDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ items: Category[]; meta: any }> {
    return this.categoriesService.findAll(churchId, queryDto);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree structure' })
  async getTree(@CurrentChurch() churchId: string): Promise<Category[]> {
    return this.categoriesService.getTree(churchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
  ): Promise<Category> {
    return this.categoriesService.findOne(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Category> {
    return this.categoriesService.update(
      churchId,
      id,
      updateCategoryDto,
      user.sub,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a category' })
  async softDelete(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    return this.categoriesService.softDelete(churchId, id, user.sub);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted category' })
  async restore(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Category> {
    return this.categoriesService.restore(churchId, id, user.sub);
  }

  @Post('reorder')
  @ApiOperation({ summary: 'Reorder multiple categories' })
  async reorder(
    @Body() reorderDto: ReorderCategoryDto[],
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Category[]> {
    return this.categoriesService.reorder(churchId, reorderDto, user.sub);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk actions on categories' })
  async bulkAction(
    @Body() bulkActionDto: BulkCategoryActionDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ success: number; failed: number }> {
    return this.categoriesService.bulkAction(churchId, bulkActionDto, user.sub);
  }
}
