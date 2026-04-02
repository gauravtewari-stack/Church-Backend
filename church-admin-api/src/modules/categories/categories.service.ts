import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentStatus } from '../../common/enums';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { Category } from './entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryQueryDto,
  ReorderCategoryDto,
  BulkCategoryActionDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(
    churchId: string,
    createCategoryDto: CreateCategoryDto,
    userId?: string,
  ): Promise<Category> {
    // Generate slug from name
    const baseSlug = slugify(createCategoryDto.name, {
      lower: true,
      strict: true,
    });
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    // Validate parent_id if provided
    if (createCategoryDto.parent_id) {
      const parent = await this.categoriesRepository.findOne({
        where: {
          id: createCategoryDto.parent_id,
          church_id: churchId,
          deleted_at: null,
        },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      slug,
      church_id: churchId,
      created_by: userId,
      updated_by: userId,
    });

    return this.categoriesRepository.save(category);
  }

  async findAll(
    churchId: string,
    queryDto: CategoryQueryDto,
  ): Promise<{ items: Category[]; meta: any }> {
    const {
      search,
      status,
      parent_id,
      sort_by = 'order',
      order_dir = 'ASC',
      page = 1,
      limit = 10,
      include_children,
    } = queryDto;

    const query = this.categoriesRepository.createQueryBuilder('category')
      .where('category.church_id = :churchId', { churchId })
      .andWhere('category.deleted_at IS NULL');

    // Apply filters
    if (search) {
      query.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      query.andWhere('category.status = :status', { status });
    }

    if (parent_id) {
      query.andWhere('category.parent_id = :parent_id', { parent_id });
    } else if (!include_children) {
      // If not including children, only show top-level categories
      query.andWhere('category.parent_id IS NULL');
    }

    // Sorting
    if (sort_by === 'name') {
      query.orderBy('category.name', order_dir);
    } else if (sort_by === 'created_at') {
      query.orderBy('category.created_at', order_dir);
    } else {
      query.orderBy('category.order', order_dir);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const [items, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(churchId: string, id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
        church_id: churchId,
        deleted_at: null,
      },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(churchId: string, slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: {
        slug,
        church_id: churchId,
        deleted_at: null,
      },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    churchId: string,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    userId?: string,
  ): Promise<Category> {
    const category = await this.findOne(churchId, id);

    // Validate parent_id if changing
    if (updateCategoryDto.parent_id && updateCategoryDto.parent_id !== category.parent_id) {
      if (updateCategoryDto.parent_id === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      const parent = await this.categoriesRepository.findOne({
        where: {
          id: updateCategoryDto.parent_id,
          church_id: churchId,
          deleted_at: null,
        },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Check for circular dependencies
      if (await this.hasCircularDependency(updateCategoryDto.parent_id, id)) {
        throw new BadRequestException(
          'Cannot set parent - would create a circular dependency',
        );
      }
    }

    // If name changed, regenerate slug
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const baseSlug = slugify(updateCategoryDto.name, {
        lower: true,
        strict: true,
      });
      updateCategoryDto.name = updateCategoryDto.name;
      category.slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;
    }

    Object.assign(category, updateCategoryDto, {
      updated_by: userId,
    });

    return this.categoriesRepository.save(category);
  }

  async softDelete(churchId: string, id: string, userId?: string): Promise<void> {
    const category = await this.findOne(churchId, id);

    // Soft delete children as well
    await this.categoriesRepository.update(
      { parent_id: id },
      {
        deleted_at: new Date(),
        updated_by: userId,
      },
    );

    await this.categoriesRepository.softDelete({
      id: category.id,
    });
  }

  async restore(churchId: string, id: string, userId?: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
        church_id: churchId,
      },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.categoriesRepository.restore({
      id: category.id,
    });

    // Update updated_by and updated_at
    await this.categoriesRepository.update(
      { id },
      { updated_by: userId, updated_at: new Date() },
    );

    return this.findOne(churchId, id);
  }

  async reorder(
    churchId: string,
    reorderDto: ReorderCategoryDto[],
    userId?: string,
  ): Promise<Category[]> {
    const results: Category[] = [];

    for (const item of reorderDto) {
      const category = await this.findOne(churchId, item.id);
      category.order = item.order;
      category.updated_by = userId;
      results.push(await this.categoriesRepository.save(category));
    }

    return results;
  }

  async bulkAction(
    churchId: string,
    bulkActionDto: BulkCategoryActionDto,
    userId?: string,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of bulkActionDto.ids) {
      try {
        const category = await this.findOne(churchId, id);

        switch (bulkActionDto.action) {
          case 'delete':
            await this.softDelete(churchId, id, userId);
            success++;
            break;
          case 'restore':
            await this.restore(churchId, id, userId);
            success++;
            break;
          case 'activate':
            category.status = ContentStatus.ACTIVE;
            category.updated_by = userId;
            await this.categoriesRepository.save(category);
            success++;
            break;
          case 'deactivate':
            category.status = ContentStatus.INACTIVE;
            category.updated_by = userId;
            await this.categoriesRepository.save(category);
            success++;
            break;
        }
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async getTree(churchId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: {
        church_id: churchId,
        parent_id: null,
        deleted_at: null,
      },
      relations: ['children'],
      order: {
        order: 'ASC',
      },
    });
  }

  async getChildrenRecursive(parentId: string): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: {
        parent_id: parentId,
        deleted_at: null,
      },
      relations: ['children'],
      order: {
        order: 'ASC',
      },
    });
  }

  private async hasCircularDependency(
    parentId: string,
    childId: string,
  ): Promise<boolean> {
    let current = parentId;
    const visited = new Set<string>();

    while (current && !visited.has(current)) {
      if (current === childId) {
        return true;
      }

      visited.add(current);

      const category = await this.categoriesRepository.findOne({
        where: { id: current, deleted_at: null },
      });

      current = category?.parent_id;
    }

    return false;
  }
}
