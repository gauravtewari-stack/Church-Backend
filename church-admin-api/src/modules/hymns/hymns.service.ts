import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { HymnEntity } from './entities/hymn.entity';
import {
  CreateHymnDto,
  UpdateHymnDto,
  HymnQueryDto,
  PublishHymnDto,
  ScheduleHymnDto,
  HymnBulkActionDto,
  HymnStatsDto,
} from './dto/hymn.dto';

@Injectable()
export class HymnsService {
  constructor(
    @InjectRepository(HymnEntity)
    private hymnRepository: Repository<HymnEntity>,
  ) {}

  /**
   * Generate unique slug
   */
  private async generateSlug(title: string, churchId: string): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    const uniqueSuffix = uuidv4().substring(0, 8);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const exists = await this.hymnRepository.findOne({
      where: { slug, church_id: churchId },
      withDeleted: true,
    });

    return exists ? await this.generateSlug(`${title}-${uuidv4().substring(0, 4)}`, churchId) : slug;
  }

  /**
   * Create hymn
   */
  async create(churchId: string, createDto: CreateHymnDto, createdBy: string): Promise<HymnEntity> {
    const slug = await this.generateSlug(createDto.title, churchId);

    const hymn = this.hymnRepository.create({
      church_id: churchId,
      slug,
      ...createDto,
      created_by: createdBy,
    });

    return this.hymnRepository.save(hymn);
  }

  /**
   * Get all hymns with pagination and filters
   */
  async findAll(churchId: string, query: HymnQueryDto): Promise<{ items: HymnEntity[]; meta: any }> {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    let queryBuilder = this.hymnRepository
      .createQueryBuilder('hymn')
      .where('hymn.church_id = :churchId', { churchId });

    // Apply filters
    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        '(hymn.title ILIKE :search OR hymn.lyrics ILIKE :search OR hymn.author ILIKE :search OR hymn.composer ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      queryBuilder = queryBuilder.andWhere('hymn.status = :status', {
        status: query.status,
      });
    }

    if (query.is_featured !== undefined) {
      queryBuilder = queryBuilder.andWhere('hymn.is_featured = :featured', {
        featured: query.is_featured,
      });
    }

    if (query.tag) {
      queryBuilder = queryBuilder.andWhere(':tag = ANY(hymn.tags)', {
        tag: query.tag,
      });
    }

    // Apply sorting
    const sortField = query.sort || '-published_at';
    const [field, direction] = sortField.startsWith('-')
      ? [sortField.substring(1), 'DESC']
      : [sortField, 'ASC'];

    const validFields = ['title', 'created_at', 'updated_at', 'published_at', 'view_count', 'hymn_number'];
    if (validFields.includes(field)) {
      queryBuilder = queryBuilder.orderBy(`hymn.${field}`, direction as 'ASC' | 'DESC');
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.skip(skip).take(limit).getMany();

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

  /**
   * Get single hymn
   */
  async findOne(churchId: string, id: string): Promise<HymnEntity> {
    const hymn = await this.hymnRepository.findOne({
      where: { id, church_id: churchId },
    });

    if (!hymn) {
      throw new NotFoundException(`Hymn with ID ${id} not found`);
    }

    return hymn;
  }

  /**
   * Update hymn
   */
  async update(churchId: string, id: string, updateDto: UpdateHymnDto): Promise<HymnEntity> {
    const hymn = await this.findOne(churchId, id);

    if (updateDto.title && updateDto.title !== hymn.title) {
      hymn.slug = await this.generateSlug(updateDto.title, churchId);
    }

    Object.assign(hymn, updateDto);
    return this.hymnRepository.save(hymn);
  }

  /**
   * Soft delete hymn
   */
  async remove(churchId: string, id: string): Promise<void> {
    const hymn = await this.findOne(churchId, id);
    await this.hymnRepository.softRemove(hymn);
  }

  /**
   * Restore soft deleted hymn
   */
  async restore(churchId: string, id: string): Promise<HymnEntity> {
    const hymn = await this.hymnRepository.findOne({
      where: { id, church_id: churchId },
      withDeleted: true,
    });

    if (!hymn) {
      throw new NotFoundException(`Hymn with ID ${id} not found`);
    }

    return this.hymnRepository.recover(hymn);
  }

  /**
   * Publish hymn
   */
  async publish(churchId: string, id: string, publishDto?: PublishHymnDto): Promise<HymnEntity> {
    const hymn = await this.findOne(churchId, id);

    hymn.status = 'published';
    hymn.published_at = publishDto?.published_at ? new Date(publishDto.published_at) : new Date();

    return this.hymnRepository.save(hymn);
  }

  /**
   * Schedule hymn for publishing
   */
  async schedule(churchId: string, id: string, scheduleDto: ScheduleHymnDto): Promise<HymnEntity> {
    const hymn = await this.findOne(churchId, id);

    const scheduledDate = new Date(scheduleDto.scheduled_at);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    hymn.status = 'scheduled';
    hymn.scheduled_at = scheduledDate;

    return this.hymnRepository.save(hymn);
  }

  /**
   * Archive hymn
   */
  async archive(churchId: string, id: string): Promise<HymnEntity> {
    const hymn = await this.findOne(churchId, id);
    hymn.status = 'archived';
    return this.hymnRepository.save(hymn);
  }

  /**
   * Duplicate hymn
   */
  async duplicate(churchId: string, id: string): Promise<HymnEntity> {
    const original = await this.findOne(churchId, id);

    const slug = await this.generateSlug(`${original.title} (Copy)`, churchId);

    const duplicate = this.hymnRepository.create({
      church_id: churchId,
      title: `${original.title} (Copy)`,
      slug,
      lyrics: original.lyrics,
      author: original.author,
      composer: original.composer,
      hymn_number: original.hymn_number,
      key: original.key,
      tempo: original.tempo,
      audio_url: original.audio_url,
      midi_url: original.midi_url,
      featured_image_url: original.featured_image_url,
      status: 'draft',
      is_featured: false,
      tags: [...original.tags],
      created_by: original.created_by,
    });

    return this.hymnRepository.save(duplicate);
  }

  /**
   * Bulk action on hymns
   */
  async bulkAction(churchId: string, bulkDto: HymnBulkActionDto): Promise<{ updated: number }> {
    const { ids, action } = bulkDto;

    if (!ids.length) {
      throw new BadRequestException('No hymns selected');
    }

    const hymns = await this.hymnRepository.find({
      where: { id: In(ids), church_id: churchId },
    });

    if (hymns.length !== ids.length) {
      throw new BadRequestException('Some hymns not found');
    }

    switch (action) {
      case 'publish':
        hymns.forEach((h) => {
          h.status = 'published';
          h.published_at = new Date();
        });
        break;
      case 'archive':
        hymns.forEach((h) => (h.status = 'archived'));
        break;
      case 'draft':
        hymns.forEach((h) => (h.status = 'draft'));
        break;
      case 'delete':
        await this.hymnRepository.softRemove(hymns);
        return { updated: hymns.length };
      default:
        throw new BadRequestException('Invalid action');
    }

    await this.hymnRepository.save(hymns);
    return { updated: hymns.length };
  }

  /**
   * Get statistics
   */
  async getStats(churchId: string): Promise<HymnStatsDto> {
    const queryBuilder = this.hymnRepository.createQueryBuilder('hymn').where('hymn.church_id = :churchId', {
      churchId,
    });

    const [results] = await queryBuilder
      .select('COUNT(*)', 'total')
      .addSelect(`SUM(CASE WHEN hymn.status = 'published' THEN 1 ELSE 0 END)`, 'published')
      .addSelect(`SUM(CASE WHEN hymn.status = 'draft' THEN 1 ELSE 0 END)`, 'draft')
      .addSelect(`SUM(CASE WHEN hymn.status = 'scheduled' THEN 1 ELSE 0 END)`, 'scheduled')
      .addSelect(`SUM(CASE WHEN hymn.status = 'archived' THEN 1 ELSE 0 END)`, 'archived')
      .addSelect(`SUM(CASE WHEN hymn.is_featured = true THEN 1 ELSE 0 END)`, 'featured')
      .addSelect('SUM(hymn.view_count)', 'viewCount')
      .getRawMany();

    return {
      total: parseInt(results.total) || 0,
      published: parseInt(results.published) || 0,
      draft: parseInt(results.draft) || 0,
      scheduled: parseInt(results.scheduled) || 0,
      archived: parseInt(results.archived) || 0,
      featured: parseInt(results.featured) || 0,
      viewCount: parseInt(results.viewCount) || 0,
    };
  }

  /**
   * Get empty state message
   */
  getEmptyState(): { message: string; action: string } {
    return {
      message: 'No hymns found. Create your first hymn to get started.',
      action: 'Create Hymn',
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(churchId: string, id: string): Promise<void> {
    const hymn = await this.findOne(churchId, id);
    hymn.view_count += 1;
    await this.hymnRepository.save(hymn);
  }
}
