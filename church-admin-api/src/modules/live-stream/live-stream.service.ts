import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { LiveStreamEntity } from './entities/live-stream.entity';
import {
  CreateLiveStreamDto,
  UpdateLiveStreamDto,
  LiveStreamQueryDto,
  GoLiveDto,
  EndStreamDto,
} from './dto/live-stream.dto';

@Injectable()
export class LiveStreamService {
  constructor(
    @InjectRepository(LiveStreamEntity)
    private liveStreamRepository: Repository<LiveStreamEntity>,
  ) {}

  /**
   * Generate unique slug
   */
  private async generateSlug(title: string, churchId: string): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    const uniqueSuffix = uuidv4().substring(0, 8);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const exists = await this.liveStreamRepository.findOne({
      where: { slug, church_id: churchId },
      withDeleted: true,
    });

    return exists ? await this.generateSlug(`${title}-${uuidv4().substring(0, 4)}`, churchId) : slug;
  }

  /**
   * Create live stream
   */
  async create(
    churchId: string,
    createDto: CreateLiveStreamDto,
    createdBy: string,
  ): Promise<LiveStreamEntity> {
    const slug = await this.generateSlug(createDto.title, churchId);

    const stream = this.liveStreamRepository.create({
      church_id: churchId,
      slug,
      status: createDto.scheduled_at ? 'scheduled' : 'scheduled',
      ...createDto,
      created_by: createdBy,
    });

    return this.liveStreamRepository.save(stream);
  }

  /**
   * Get all live streams with pagination and filters
   */
  async findAll(
    churchId: string,
    query: LiveStreamQueryDto,
  ): Promise<{ items: LiveStreamEntity[]; meta: any }> {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    let queryBuilder = this.liveStreamRepository
      .createQueryBuilder('stream')
      .where('stream.church_id = :churchId', { churchId });

    // Apply filters
    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        '(stream.title ILIKE :search OR stream.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.status) {
      queryBuilder = queryBuilder.andWhere('stream.status = :status', {
        status: query.status,
      });
    }

    if (query.is_featured !== undefined) {
      queryBuilder = queryBuilder.andWhere('stream.is_featured = :featured', {
        featured: query.is_featured,
      });
    }

    if (query.platform) {
      queryBuilder = queryBuilder.andWhere('stream.platform = :platform', {
        platform: query.platform,
      });
    }

    // Apply sorting
    const sortField = query.sort || '-scheduled_at';
    const [field, direction] = sortField.startsWith('-')
      ? [sortField.substring(1), 'DESC']
      : [sortField, 'ASC'];

    const validFields = ['title', 'created_at', 'updated_at', 'scheduled_at', 'started_at', 'view_count'];
    if (validFields.includes(field)) {
      queryBuilder = queryBuilder.orderBy(`stream.${field}`, direction as 'ASC' | 'DESC');
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
   * Get single live stream
   */
  async findOne(churchId: string, id: string): Promise<LiveStreamEntity> {
    const stream = await this.liveStreamRepository.findOne({
      where: { id, church_id: churchId },
    });

    if (!stream) {
      throw new NotFoundException(`Live stream with ID ${id} not found`);
    }

    return stream;
  }

  /**
   * Update live stream
   */
  async update(
    churchId: string,
    id: string,
    updateDto: UpdateLiveStreamDto,
  ): Promise<LiveStreamEntity> {
    const stream = await this.findOne(churchId, id);

    if (updateDto.title && updateDto.title !== stream.title) {
      stream.slug = await this.generateSlug(updateDto.title, churchId);
    }

    Object.assign(stream, updateDto);
    return this.liveStreamRepository.save(stream);
  }

  /**
   * Soft delete live stream
   */
  async remove(churchId: string, id: string): Promise<void> {
    const stream = await this.findOne(churchId, id);
    await this.liveStreamRepository.softRemove(stream);
  }

  /**
   * Restore soft deleted live stream
   */
  async restore(churchId: string, id: string): Promise<LiveStreamEntity> {
    const stream = await this.liveStreamRepository.findOne({
      where: { id, church_id: churchId },
      withDeleted: true,
    });

    if (!stream) {
      throw new NotFoundException(`Live stream with ID ${id} not found`);
    }

    return this.liveStreamRepository.recover(stream);
  }

  /**
   * Start live stream
   */
  async goLive(churchId: string, id: string, goLiveDto?: GoLiveDto): Promise<LiveStreamEntity> {
    const stream = await this.findOne(churchId, id);

    stream.status = 'live';
    stream.started_at = goLiveDto?.started_at ? new Date(goLiveDto.started_at) : new Date();

    return this.liveStreamRepository.save(stream);
  }

  /**
   * End live stream
   */
  async endStream(churchId: string, id: string, endDto?: EndStreamDto): Promise<LiveStreamEntity> {
    const stream = await this.findOne(churchId, id);

    if (stream.status !== 'live') {
      throw new BadRequestException('Stream is not currently live');
    }

    stream.status = 'ended';
    stream.ended_at = endDto?.ended_at ? new Date(endDto.ended_at) : new Date();

    return this.liveStreamRepository.save(stream);
  }

  /**
   * Archive stream
   */
  async archive(churchId: string, id: string): Promise<LiveStreamEntity> {
    const stream = await this.findOne(churchId, id);
    stream.status = 'archived';
    return this.liveStreamRepository.save(stream);
  }

  /**
   * Find upcoming live streams
   */
  async findUpcoming(
    churchId: string,
    limit: number = 10,
  ): Promise<LiveStreamEntity[]> {
    const now = new Date();

    return this.liveStreamRepository
      .createQueryBuilder('stream')
      .where('stream.church_id = :churchId', { churchId })
      .andWhere('stream.status = :status', { status: 'scheduled' })
      .andWhere('stream.scheduled_at > :now', { now })
      .orderBy('stream.scheduled_at', 'ASC')
      .take(limit)
      .getMany();
  }

  /**
   * Find currently active streams
   */
  async findActive(churchId: string): Promise<LiveStreamEntity[]> {
    return this.liveStreamRepository.find({
      where: {
        church_id: churchId,
        status: 'live',
      },
      order: {
        started_at: 'DESC',
      },
    });
  }

  /**
   * Find recent ended streams
   */
  async findRecent(churchId: string, limit: number = 10): Promise<LiveStreamEntity[]> {
    return this.liveStreamRepository
      .createQueryBuilder('stream')
      .where('stream.church_id = :churchId', { churchId })
      .andWhere('stream.status = :status', { status: 'ended' })
      .orderBy('stream.ended_at', 'DESC')
      .take(limit)
      .getMany();
  }

  /**
   * Get statistics
   */
  async getStats(churchId: string): Promise<{
    total: number;
    scheduled: number;
    live: number;
    ended: number;
    archived: number;
    totalViews: number;
  }> {
    const queryBuilder = this.liveStreamRepository
      .createQueryBuilder('stream')
      .where('stream.church_id = :churchId', { churchId });

    const [results] = await queryBuilder
      .select('COUNT(*)', 'total')
      .addSelect(`SUM(CASE WHEN stream.status = 'scheduled' THEN 1 ELSE 0 END)`, 'scheduled')
      .addSelect(`SUM(CASE WHEN stream.status = 'live' THEN 1 ELSE 0 END)`, 'live')
      .addSelect(`SUM(CASE WHEN stream.status = 'ended' THEN 1 ELSE 0 END)`, 'ended')
      .addSelect(`SUM(CASE WHEN stream.status = 'archived' THEN 1 ELSE 0 END)`, 'archived')
      .addSelect('SUM(stream.view_count)', 'totalViews')
      .getRawMany();

    return {
      total: parseInt(results.total) || 0,
      scheduled: parseInt(results.scheduled) || 0,
      live: parseInt(results.live) || 0,
      ended: parseInt(results.ended) || 0,
      archived: parseInt(results.archived) || 0,
      totalViews: parseInt(results.totalViews) || 0,
    };
  }

  /**
   * Get empty state message
   */
  getEmptyState(): { message: string; action: string } {
    return {
      message: 'No live streams found. Schedule your first stream to get started.',
      action: 'Create Stream',
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(churchId: string, id: string): Promise<void> {
    const stream = await this.findOne(churchId, id);
    stream.view_count += 1;
    await this.liveStreamRepository.save(stream);
  }
}
