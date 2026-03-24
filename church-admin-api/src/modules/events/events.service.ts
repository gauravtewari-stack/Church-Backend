import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  IsNull,
  MoreThanOrEqual,
  LessThanOrEqual,
  Not,
  Between,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Event } from './entities/event.entity';
import { ContentStatus } from '../../common/enums';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
  BulkEventActionDto,
  PublishEventDto,
  ArchiveEventDto,
  DuplicateEventDto,
  EventStatsDto,
} from './dto/event.dto';
import { SlugUtil } from '../../common/utils/slug.util';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
  ) {}

  /**
   * Create a new event
   */
  async create(
    churchId: string,
    createEventDto: CreateEventDto,
    userId?: string,
  ): Promise<Event> {
    // Generate unique slug
    const baseSlug = SlugUtil.generate(createEventDto.title);
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    // Check if slug already exists (rare case)
    const existing = await this.eventsRepository.findOne({
      where: { slug, church_id: churchId, deleted_at: IsNull() },
    });

    if (existing) {
      throw new ConflictException('Event with similar title already exists');
    }

    const event = this.eventsRepository.create({
      ...createEventDto,
      slug,
      church_id: churchId,
      status: createEventDto.status || ContentStatus.DRAFT,
      created_by: userId,
      updated_by: userId,
      event_date: new Date(createEventDto.event_date),
      event_end_date: createEventDto.event_end_date
        ? new Date(createEventDto.event_end_date)
        : null,
    });

    return this.eventsRepository.save(event);
  }

  /**
   * Find all events with filters and pagination
   */
  async findAll(
    churchId: string,
    queryDto: EventQueryDto,
  ): Promise<PaginatedResponseDto<Event>> {
    const {
      search,
      status,
      category_id,
      date_from,
      date_to,
      is_virtual,
      is_featured,
      rsvp_enabled,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = queryDto;

    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.church_id = :churchId', { churchId })
      .andWhere('event.deleted_at IS NULL');

    // Apply search filter
    if (search) {
      query.andWhere(
        '(event.title ILIKE :search OR event.description ILIKE :search OR event.location_name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      query.andWhere('event.status = :status', { status });
    }

    // Apply category filter
    if (category_id) {
      query.innerJoinAndSelect(
        'event.categories',
        'categories',
        'categories.id = :category_id',
        { category_id },
      );
    } else {
      query.leftJoinAndSelect('event.categories', 'categories');
    }

    // Apply date range filter
    if (date_from && date_to) {
      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);
      query.andWhere(
        'event.event_date BETWEEN :fromDate AND :toDate',
        { fromDate, toDate },
      );
    } else if (date_from) {
      query.andWhere('event.event_date >= :fromDate', {
        fromDate: new Date(date_from),
      });
    } else if (date_to) {
      query.andWhere('event.event_date <= :toDate', {
        toDate: new Date(date_to),
      });
    }

    // Apply virtual filter
    if (is_virtual !== undefined) {
      query.andWhere('event.is_virtual = :is_virtual', { is_virtual });
    }

    // Apply featured filter
    if (is_featured !== undefined) {
      query.andWhere('event.is_featured = :is_featured', { is_featured });
    }

    // Apply RSVP filter
    if (rsvp_enabled !== undefined) {
      query.andWhere('event.rsvp_enabled = :rsvp_enabled', { rsvp_enabled });
    }

    // Get total count for pagination
    const total = await query.getCount();

    // Apply sorting
    const validSortFields = [
      'event_date',
      'created_at',
      'updated_at',
      'title',
      'rsvp_count',
      'view_count',
    ];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    query.orderBy(`event.${sortField}`, sort_order);

    // Apply pagination
    const offset = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    query.skip(offset).take(safeLimit);

    const items = await query.getMany();

    return new PaginatedResponseDto(
      items,
      Math.max(page, 1),
      safeLimit,
      total,
      { search, status, category_id, date_from, date_to, is_virtual },
    );
  }

  /**
   * Find event by ID
   */
  async findOne(churchId: string, id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id, church_id: churchId, deleted_at: IsNull() },
      relations: ['categories'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Find event by slug
   */
  async findBySlug(churchId: string, slug: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { slug, church_id: churchId, deleted_at: IsNull() },
      relations: ['categories'],
    });

    if (!event) {
      throw new NotFoundException(`Event with slug ${slug} not found`);
    }

    // Increment view count
    event.view_count = (event.view_count || 0) + 1;
    await this.eventsRepository.save(event);

    return event;
  }

  /**
   * Update event
   */
  async update(
    churchId: string,
    id: string,
    updateEventDto: UpdateEventDto,
    userId?: string,
  ): Promise<Event> {
    const event = await this.findOne(churchId, id);

    // Generate new slug if title changed
    if (updateEventDto.title && updateEventDto.title !== event.title) {
      const baseSlug = SlugUtil.generate(updateEventDto.title);
      const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

      const existing = await this.eventsRepository.findOne({
        where: {
          slug,
          church_id: churchId,
          deleted_at: IsNull(),
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException('An event with this title already exists');
      }

      event.slug = slug;
    }

    // Update fields
    Object.assign(event, {
      ...updateEventDto,
      updated_by: userId,
      event_date: updateEventDto.event_date
        ? new Date(updateEventDto.event_date)
        : event.event_date,
      event_end_date: updateEventDto.event_end_date
        ? new Date(updateEventDto.event_end_date)
        : event.event_end_date,
    });

    return this.eventsRepository.save(event);
  }

  /**
   * Publish event
   */
  async publish(
    churchId: string,
    id: string,
    publishDto?: PublishEventDto,
    userId?: string,
  ): Promise<Event> {
    const event = await this.findOne(churchId, id);

    if (publishDto?.scheduled_at) {
      const scheduledAt = new Date(publishDto.scheduled_at);
      if (scheduledAt <= new Date()) {
        throw new BadRequestException(
          'Scheduled date must be in the future',
        );
      }

      event.status = ContentStatus.SCHEDULED;
      event.scheduled_at = scheduledAt;
    } else {
      event.status = ContentStatus.PUBLISHED;
      event.published_at = new Date();
    }

    event.updated_by = userId;

    return this.eventsRepository.save(event);
  }

  /**
   * Schedule event
   */
  async schedule(
    churchId: string,
    id: string,
    scheduledAt: Date,
    userId?: string,
  ): Promise<Event> {
    const event = await this.findOne(churchId, id);

    if (scheduledAt <= new Date()) {
      throw new BadRequestException(
        'Scheduled date must be in the future',
      );
    }

    event.status = ContentStatus.SCHEDULED;
    event.scheduled_at = scheduledAt;
    event.updated_by = userId;

    return this.eventsRepository.save(event);
  }

  /**
   * Archive event
   */
  async archive(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<Event> {
    const event = await this.findOne(churchId, id);

    event.status = ContentStatus.ARCHIVED;
    event.updated_by = userId;

    return this.eventsRepository.save(event);
  }

  /**
   * Soft delete event
   */
  async softDelete(churchId: string, id: string, userId?: string): Promise<Event> {
    const event = await this.findOne(churchId, id);

    event.deleted_at = new Date();
    event.updated_by = userId;

    return this.eventsRepository.save(event);
  }

  /**
   * Restore soft-deleted event
   */
  async restore(churchId: string, id: string, userId?: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id, church_id: churchId, deleted_at: Not(IsNull()) },
      relations: ['categories'],
    });

    if (!event) {
      throw new NotFoundException(`Deleted event with ID ${id} not found`);
    }

    event.deleted_at = null;
    event.updated_by = userId;

    return this.eventsRepository.save(event);
  }

  /**
   * Duplicate event
   */
  async duplicate(
    churchId: string,
    id: string,
    duplicateDto: DuplicateEventDto,
    userId?: string,
  ): Promise<Event> {
    const originalEvent = await this.findOne(churchId, id);

    // Generate unique slug
    const baseSlug = SlugUtil.generate(duplicateDto.title);
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    const newEvent = this.eventsRepository.create({
      ...originalEvent,
      id: undefined,
      slug,
      title: duplicateDto.title,
      status: ContentStatus.DRAFT,
      published_at: null,
      scheduled_at: null,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null,
    });

    // Copy categories if requested
    if (duplicateDto.include_categories && originalEvent.categories?.length > 0) {
      newEvent.categories = originalEvent.categories;
    }

    return this.eventsRepository.save(newEvent);
  }

  /**
   * Perform bulk actions on multiple events
   */
  async bulkAction(
    churchId: string,
    bulkDto: BulkEventActionDto,
    userId?: string,
  ): Promise<{ updated: number; failed: number }> {
    const { event_ids, action, status } = bulkDto;

    if (!event_ids || event_ids.length === 0) {
      throw new BadRequestException('No event IDs provided');
    }

    if (event_ids.length > 100) {
      throw new BadRequestException('Cannot perform bulk action on more than 100 events');
    }

    let updated = 0;
    let failed = 0;

    for (const eventId of event_ids) {
      try {
        const event = await this.findOne(churchId, eventId);

        switch (action) {
          case 'publish':
            event.status = ContentStatus.PUBLISHED;
            event.published_at = new Date();
            break;
          case 'archive':
            event.status = ContentStatus.ARCHIVED;
            break;
          case 'delete':
            event.deleted_at = new Date();
            break;
          case 'restore':
            event.deleted_at = null;
            break;
          case 'feature':
            event.is_featured = true;
            break;
          case 'unfeature':
            event.is_featured = false;
            break;
          default:
            throw new BadRequestException(`Unknown action: ${action}`);
        }

        event.updated_by = userId;
        await this.eventsRepository.save(event);
        updated++;
      } catch (error) {
        failed++;
      }
    }

    return { updated, failed };
  }

  /**
   * Get upcoming events
   */
  async getUpcoming(
    churchId: string,
    limit: number = 5,
  ): Promise<Event[]> {
    const now = new Date();

    return this.eventsRepository.find({
      where: {
        church_id: churchId,
        status: In([ContentStatus.PUBLISHED, ContentStatus.SCHEDULED]),
        event_date: MoreThanOrEqual(now),
        deleted_at: IsNull(),
      },
      order: { event_date: 'ASC' },
      take: Math.min(Math.max(limit, 1), 50),
      relations: ['categories'],
    });
  }

  /**
   * Get event statistics
   */
  async getStats(churchId: string): Promise<EventStatsDto> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.church_id = :churchId', { churchId })
      .andWhere('event.deleted_at IS NULL');

    const [
      draftCount,
      publishedCount,
      scheduledCount,
      archivedCount,
      totalCount,
      totalRsvpCount,
      totalViews,
      featuredCount,
    ] = await Promise.all([
      query
        .clone()
        .andWhere('event.status = :status', { status: ContentStatus.DRAFT })
        .getCount(),
      query
        .clone()
        .andWhere('event.status = :status', { status: ContentStatus.PUBLISHED })
        .getCount(),
      query
        .clone()
        .andWhere('event.status = :status', { status: ContentStatus.SCHEDULED })
        .getCount(),
      query
        .clone()
        .andWhere('event.status = :status', { status: ContentStatus.ARCHIVED })
        .getCount(),
      query.clone().getCount(),
      query
        .clone()
        .select('SUM(event.rsvp_count)', 'total')
        .getRawOne(),
      query
        .clone()
        .select('SUM(event.view_count)', 'total')
        .getRawOne(),
      query
        .clone()
        .andWhere('event.is_featured = true')
        .getCount(),
    ]);

    const upcomingCount = await query
      .clone()
      .andWhere('event.event_date >= :now', { now: new Date() })
      .andWhere('event.status IN (:...statuses)', {
        statuses: [ContentStatus.PUBLISHED, ContentStatus.SCHEDULED],
      })
      .getCount();

    return {
      total_events: totalCount,
      draft_count: draftCount,
      published_count: publishedCount,
      scheduled_count: scheduledCount,
      archived_count: archivedCount,
      total_rsvp_count: totalRsvpCount?.total || 0,
      total_views: totalViews?.total || 0,
      upcoming_events_count: upcomingCount,
      featured_events_count: featuredCount,
    };
  }

  /**
   * Get empty state info
   */
  async getEmptyState(churchId: string): Promise<{ message: string; action_url: string }> {
    const count = await this.eventsRepository.count({
      where: { church_id: churchId, deleted_at: IsNull() },
    });

    return {
      message:
        count === 0
          ? 'No events found. Create your first event to get started.'
          : 'No events match your search criteria.',
      action_url: '/events/create',
    };
  }

  /**
   * Increment RSVP count for an event
   */
  async incrementRsvpCount(churchId: string, eventId: string): Promise<Event> {
    const event = await this.findOne(churchId, eventId);

    if (!event.rsvp_enabled) {
      throw new BadRequestException('RSVP is not enabled for this event');
    }

    if (event.max_attendees && event.rsvp_count >= event.max_attendees) {
      throw new BadRequestException('Event has reached maximum capacity');
    }

    event.rsvp_count = (event.rsvp_count || 0) + 1;

    return this.eventsRepository.save(event);
  }
}
