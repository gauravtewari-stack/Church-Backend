import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { SpiritualResourceEntity } from './entities/spiritual-resource.entity';
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceQueryDto,
  PublishResourceDto,
  ScheduleResourceDto,
  BulkActionDto,
  ResourceStatsDto,
} from './dto/spiritual-resource.dto';

@Injectable()
export class SpiritualLibraryService {
  constructor(
    @InjectRepository(SpiritualResourceEntity)
    private resourceRepository: Repository<SpiritualResourceEntity>,
  ) {}

  /**
   * Generate unique slug
   */
  private async generateSlug(title: string, churchId: string): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    const uniqueSuffix = uuidv4().substring(0, 8);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const exists = await this.resourceRepository.findOne({
      where: { slug, church_id: churchId },
      withDeleted: true,
    });

    return exists ? await this.generateSlug(`${title}-${uuidv4().substring(0, 4)}`, churchId) : slug;
  }

  /**
   * Create resource
   */
  async create(
    churchId: string,
    createDto: CreateResourceDto,
    createdBy: string,
  ): Promise<SpiritualResourceEntity> {
    const slug = await this.generateSlug(createDto.title, churchId);

    const resource = this.resourceRepository.create({
      church_id: churchId,
      slug,
      ...createDto,
      created_by: createdBy,
    });

    return this.resourceRepository.save(resource);
  }

  /**
   * Get all resources with pagination and filters
   */
  async findAll(
    churchId: string,
    query: ResourceQueryDto,
  ): Promise<{ items: SpiritualResourceEntity[]; meta: any }> {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    let queryBuilder = this.resourceRepository
      .createQueryBuilder('resource')
      .where('resource.church_id = :churchId', { churchId });

    // Apply filters
    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        '(resource.title ILIKE :search OR resource.content ILIKE :search OR resource.author ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.resource_type) {
      queryBuilder = queryBuilder.andWhere('resource.resource_type = :type', {
        type: query.resource_type,
      });
    }

    if (query.status) {
      queryBuilder = queryBuilder.andWhere('resource.status = :status', {
        status: query.status,
      });
    }

    if (query.is_featured !== undefined) {
      queryBuilder = queryBuilder.andWhere('resource.is_featured = :featured', {
        featured: query.is_featured,
      });
    }

    if (query.tag) {
      queryBuilder = queryBuilder.andWhere(':tag = ANY(resource.tags)', {
        tag: query.tag,
      });
    }

    // Apply sorting
    const sortField = query.sort || '-published_at';
    const [field, direction] = sortField.startsWith('-')
      ? [sortField.substring(1), 'DESC']
      : [sortField, 'ASC'];

    const validFields = ['title', 'created_at', 'updated_at', 'published_at', 'view_count'];
    if (validFields.includes(field)) {
      queryBuilder = queryBuilder.orderBy(`resource.${field}`, direction as 'ASC' | 'DESC');
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
   * Get single resource by ID
   */
  async findOne(churchId: string, id: string): Promise<SpiritualResourceEntity> {
    const resource = await this.resourceRepository.findOne({
      where: { id, church_id: churchId },
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return resource;
  }

  /**
   * Update resource
   */
  async update(
    churchId: string,
    id: string,
    updateDto: UpdateResourceDto,
  ): Promise<SpiritualResourceEntity> {
    const resource = await this.findOne(churchId, id);

    if (updateDto.title && updateDto.title !== resource.title) {
      resource.slug = await this.generateSlug(updateDto.title, churchId);
    }

    Object.assign(resource, updateDto);
    return this.resourceRepository.save(resource);
  }

  /**
   * Soft delete resource
   */
  async remove(churchId: string, id: string): Promise<void> {
    const resource = await this.findOne(churchId, id);
    await this.resourceRepository.softRemove(resource);
  }

  /**
   * Restore soft deleted resource
   */
  async restore(churchId: string, id: string): Promise<SpiritualResourceEntity> {
    const resource = await this.resourceRepository.findOne({
      where: { id, church_id: churchId },
      withDeleted: true,
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return this.resourceRepository.recover(resource);
  }

  /**
   * Publish resource
   */
  async publish(
    churchId: string,
    id: string,
    publishDto?: PublishResourceDto,
  ): Promise<SpiritualResourceEntity> {
    const resource = await this.findOne(churchId, id);

    resource.status = 'published';
    resource.published_at = publishDto?.published_at ? new Date(publishDto.published_at) : new Date();

    return this.resourceRepository.save(resource);
  }

  /**
   * Schedule resource for publishing
   */
  async schedule(
    churchId: string,
    id: string,
    scheduleDto: ScheduleResourceDto,
  ): Promise<SpiritualResourceEntity> {
    const resource = await this.findOne(churchId, id);

    const scheduledDate = new Date(scheduleDto.scheduled_at);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    resource.status = 'scheduled';
    resource.scheduled_at = scheduledDate;

    return this.resourceRepository.save(resource);
  }

  /**
   * Archive resource
   */
  async archive(churchId: string, id: string): Promise<SpiritualResourceEntity> {
    const resource = await this.findOne(churchId, id);
    resource.status = 'archived';
    return this.resourceRepository.save(resource);
  }

  /**
   * Duplicate resource
   */
  async duplicate(churchId: string, id: string): Promise<SpiritualResourceEntity> {
    const original = await this.findOne(churchId, id);

    const slug = await this.generateSlug(`${original.title} (Copy)`, churchId);

    const duplicate = this.resourceRepository.create({
      church_id: churchId,
      title: `${original.title} (Copy)`,
      slug,
      author: original.author,
      content: original.content,
      summary: original.summary,
      featured_image_url: original.featured_image_url,
      resource_type: original.resource_type,
      file_url: original.file_url,
      status: 'draft',
      is_featured: false,
      seo_title: original.seo_title,
      seo_description: original.seo_description,
      tags: [...original.tags],
      created_by: original.created_by,
    });

    return this.resourceRepository.save(duplicate);
  }

  /**
   * Bulk action on resources
   */
  async bulkAction(churchId: string, bulkDto: BulkActionDto): Promise<{ updated: number }> {
    const { ids, action } = bulkDto;

    if (!ids.length) {
      throw new BadRequestException('No resources selected');
    }

    const resources = await this.resourceRepository.find({
      where: { id: In(ids), church_id: churchId },
    });

    if (resources.length !== ids.length) {
      throw new BadRequestException('Some resources not found');
    }

    switch (action) {
      case 'publish':
        resources.forEach((r) => {
          r.status = 'published';
          r.published_at = new Date();
        });
        break;
      case 'archive':
        resources.forEach((r) => (r.status = 'archived'));
        break;
      case 'draft':
        resources.forEach((r) => (r.status = 'draft'));
        break;
      case 'delete':
        await this.resourceRepository.softRemove(resources);
        return { updated: resources.length };
      default:
        throw new BadRequestException('Invalid action');
    }

    await this.resourceRepository.save(resources);
    return { updated: resources.length };
  }

  /**
   * Get statistics
   */
  async getStats(churchId: string): Promise<ResourceStatsDto> {
    const queryBuilder = this.resourceRepository.createQueryBuilder('resource').where('resource.church_id = :churchId', {
      churchId,
    });

    const [results] = await queryBuilder
      .select('COUNT(*)', 'total')
      .addSelect(
        `SUM(CASE WHEN resource.status = 'published' THEN 1 ELSE 0 END)`,
        'published',
      )
      .addSelect(`SUM(CASE WHEN resource.status = 'draft' THEN 1 ELSE 0 END)`, 'draft')
      .addSelect(
        `SUM(CASE WHEN resource.status = 'scheduled' THEN 1 ELSE 0 END)`,
        'scheduled',
      )
      .addSelect(
        `SUM(CASE WHEN resource.status = 'archived' THEN 1 ELSE 0 END)`,
        'archived',
      )
      .addSelect(
        `SUM(CASE WHEN resource.is_featured = true THEN 1 ELSE 0 END)`,
        'featured',
      )
      .addSelect('SUM(resource.view_count)', 'viewCount')
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
      message: 'No spiritual resources found. Create your first resource to get started.',
      action: 'Create Resource',
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(churchId: string, id: string): Promise<void> {
    const resource = await this.findOne(churchId, id);
    resource.view_count += 1;
    await this.resourceRepository.save(resource);
  }
}
