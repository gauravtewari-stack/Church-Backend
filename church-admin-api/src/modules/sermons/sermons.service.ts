import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { Sermon } from './entities/sermon.entity';
import { ContentStatus } from '../../common/enums';
import {
  CreateSermonDto,
  UpdateSermonDto,
  SermonQueryDto,
  DuplicateSermonDto,
  BulkActionDto,
} from './dto/sermon.dto';

@Injectable()
export class SermonsService {
  constructor(
    @InjectRepository(Sermon)
    private sermonsRepository: Repository<Sermon>,
  ) {}

  async create(
    churchId: string,
    createSermonDto: CreateSermonDto,
    userId?: string,
  ): Promise<Sermon> {
    // Generate slug from title
    const baseSlug = slugify(createSermonDto.title, {
      lower: true,
      strict: true,
    });
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    const sermon = this.sermonsRepository.create({
      ...createSermonDto,
      slug,
      church_id: churchId,
      status: ContentStatus.DRAFT,
      created_by: userId,
      updated_by: userId,
    });

    return this.sermonsRepository.save(sermon);
  }

  async findAll(
    churchId: string,
    queryDto: SermonQueryDto,
  ): Promise<{ items: Sermon[]; meta: any }> {
    const {
      search,
      status,
      category_id,
      speaker,
      from_date,
      to_date,
      is_featured,
      sort_by = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 10,
      include_relations = false,
    } = queryDto;

    const query = this.sermonsRepository.createQueryBuilder('sermon')
      .where('sermon.church_id = :churchId', { churchId })
      .andWhere('sermon.deleted_at IS NULL');

    // Apply filters
    if (search) {
      query.andWhere(
        '(sermon.title ILIKE :search OR sermon.description ILIKE :search OR sermon.speaker ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      query.andWhere('sermon.status = :status', { status });
    }

    if (category_id) {
      query.innerJoinAndSelect(
        'sermon.categories',
        'categories',
        'categories.id = :category_id',
        { category_id },
      );
    } else if (include_relations) {
      query.leftJoinAndSelect('sermon.categories', 'categories');
    }

    if (speaker) {
      query.andWhere('sermon.speaker ILIKE :speaker', {
        speaker: `%${speaker}%`,
      });
    }

    if (from_date) {
      query.andWhere('sermon.sermon_date >= :from_date', { from_date });
    }

    if (to_date) {
      query.andWhere('sermon.sermon_date <= :to_date', { to_date });
    }

    if (is_featured !== undefined) {
      query.andWhere('sermon.is_featured = :is_featured', { is_featured });
    }

    // Sorting
    if (sort_by === 'published_date') {
      query.orderBy('sermon.published_date', order);
    } else if (sort_by === 'sermon_date') {
      query.orderBy('sermon.sermon_date', order);
    } else if (sort_by === 'views_count') {
      query.orderBy('sermon.views_count', order);
    } else if (sort_by === 'title') {
      query.orderBy('sermon.title', order);
    } else {
      query.orderBy('sermon.created_at', order);
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

  async findOne(churchId: string, id: string): Promise<Sermon> {
    const sermon = await this.sermonsRepository.findOne({
      where: {
        id,
        church_id: churchId,
        deleted_at: IsNull(),
      },
      relations: ['categories', 'media'],
    });

    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    return sermon;
  }

  async findBySlug(churchId: string, slug: string): Promise<Sermon> {
    const sermon = await this.sermonsRepository.findOne({
      where: {
        slug,
        church_id: churchId,
        deleted_at: IsNull(),
      },
      relations: ['categories', 'media'],
    });

    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    return sermon;
  }

  async update(
    churchId: string,
    id: string,
    updateSermonDto: UpdateSermonDto,
    userId?: string,
  ): Promise<Sermon> {
    const sermon = await this.findOne(churchId, id);

    // Regenerate slug if title changes
    if (updateSermonDto.title && updateSermonDto.title !== sermon.title) {
      const baseSlug = slugify(updateSermonDto.title, {
        lower: true,
        strict: true,
      });
      sermon.slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;
    }

    Object.assign(sermon, updateSermonDto, {
      updated_by: userId,
    });

    return this.sermonsRepository.save(sermon);
  }

  async publish(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<Sermon> {
    const sermon = await this.findOne(churchId, id);

    // Validate required fields for publishing
    if (!sermon.title || !sermon.description) {
      throw new BadRequestException(
        'Title and description are required to publish',
      );
    }

    sermon.status = ContentStatus.PUBLISHED;
    sermon.published_date = new Date().toISOString();
    sermon.updated_by = userId;

    return this.sermonsRepository.save(sermon);
  }

  async schedule(
    churchId: string,
    id: string,
    scheduledAt: Date,
    userId?: string,
  ): Promise<Sermon> {
    const sermon = await this.findOne(churchId, id);

    // Validate required fields for scheduling
    if (!sermon.title || !sermon.description) {
      throw new BadRequestException(
        'Title and description are required to schedule',
      );
    }

    if (scheduledAt <= new Date()) {
      throw new BadRequestException(
        'Scheduled date must be in the future',
      );
    }

    sermon.status = ContentStatus.SCHEDULED;
    sermon.scheduled_at = scheduledAt;
    sermon.updated_by = userId;

    return this.sermonsRepository.save(sermon);
  }

  async archive(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<Sermon> {
    const sermon = await this.findOne(churchId, id);

    sermon.status = ContentStatus.ARCHIVED;
    sermon.updated_by = userId;

    return this.sermonsRepository.save(sermon);
  }

  async softDelete(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<void> {
    const sermon = await this.findOne(churchId, id);

    await this.sermonsRepository.softDelete({
      id: sermon.id,
    });
  }

  async restore(churchId: string, id: string, userId?: string): Promise<Sermon> {
    const sermon = await this.sermonsRepository.findOne({
      where: {
        id,
        church_id: churchId,
      },
      withDeleted: true,
    });

    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    await this.sermonsRepository.restore({
      id: sermon.id,
    });

    // Update updated_by and updated_at
    await this.sermonsRepository.update(
      { id },
      { updated_by: userId, updated_at: new Date() },
    );

    return this.findOne(churchId, id);
  }

  async duplicate(
    churchId: string,
    id: string,
    duplicateDto: DuplicateSermonDto,
    userId?: string,
  ): Promise<Sermon> {
    const original = await this.findOne(churchId, id);

    const newTitle = `${original.title} ${duplicateDto.title_suffix || '(Copy)'}`;
    const baseSlug = slugify(newTitle, {
      lower: true,
      strict: true,
    });
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    const duplicate = this.sermonsRepository.create({
      ...original,
      id: undefined, // Generate new ID
      slug,
      title: newTitle,
      status: ContentStatus.DRAFT,
      published_date: null,
      scheduled_at: null,
      views_count: 0,
      created_by: userId,
      updated_by: userId,
    });

    const saved = await this.sermonsRepository.save(duplicate);

    // Duplicate categories and media relationships
    if (original.categories?.length) {
      // Categories will be set through a separate call or manually
    }

    return this.findOne(churchId, saved.id);
  }

  async bulkAction(
    churchId: string,
    bulkActionDto: BulkActionDto,
    userId?: string,
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const id of bulkActionDto.ids) {
      try {
        const sermon = await this.findOne(churchId, id);

        switch (bulkActionDto.action) {
          case 'publish':
            await this.publish(churchId, id, userId);
            success++;
            break;
          case 'archive':
            await this.archive(churchId, id, userId);
            success++;
            break;
          case 'delete':
            await this.softDelete(churchId, id, userId);
            success++;
            break;
          case 'restore':
            await this.restore(churchId, id, userId);
            success++;
            break;
          case 'feature':
            sermon.is_featured = true;
            sermon.updated_by = userId;
            await this.sermonsRepository.save(sermon);
            success++;
            break;
          case 'unfeature':
            sermon.is_featured = false;
            sermon.updated_by = userId;
            await this.sermonsRepository.save(sermon);
            success++;
            break;
        }
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.sermonsRepository.increment(
      { id },
      'views_count',
      1,
    );
  }

  async getStats(churchId: string): Promise<any> {
    const result = await this.sermonsRepository
      .createQueryBuilder('sermon')
      .where('sermon.church_id = :churchId', { churchId })
      .andWhere('sermon.deleted_at IS NULL')
      .select('COUNT(*)', 'total')
      .addSelect('sermon.status', 'status')
      .groupBy('sermon.status')
      .getRawMany();

    const stats = {
      total: 0,
      by_status: {
        [ContentStatus.DRAFT]: 0,
        [ContentStatus.PUBLISHED]: 0,
        [ContentStatus.SCHEDULED]: 0,
        [ContentStatus.ARCHIVED]: 0,
      },
    };

    for (const row of result) {
      stats.total += parseInt(row.total);
      stats.by_status[row.status] = parseInt(row.total);
    }

    return stats;
  }

  async getEmptyState(churchId: string): Promise<any> {
    const totalCount = await this.sermonsRepository.count({
      where: {
        church_id: churchId,
        deleted_at: IsNull(),
      },
    });

    return {
      is_empty: totalCount === 0,
      total_count: totalCount,
      suggested_action: totalCount === 0 ? 'Create your first sermon' : null,
    };
  }
}
