import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ContentStatus } from '../../common/enums';

/**
 * Public Service
 * Handles queries for publicly accessible content from the public API
 * All queries are read-only and filter by published status
 */
@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Get church by slug
   * Validates that the church exists and is active
   */
  async getChurchBySlug(churchSlug: string): Promise<any> {
    const church = await this.dataSource
      .getRepository('churches')
      .findOne({
        where: {
          slug: churchSlug,
          is_active: true,
          deleted_at: null,
        },
      });

    if (!church) {
      throw new NotFoundException(`Church with slug "${churchSlug}" not found`);
    }

    return church;
  }

  /**
   * Get published sermons for a church (paginated)
   */
  async getPublishedSermons(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [sermons, total] = await this.dataSource
      .getRepository('sermons')
      .findAndCount({
        where: {
          church_id: churchId,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
        order: {
          published_at: 'DESC',
          sermon_date: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: sermons,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single sermon by slug
   */
  async getSermonBySlug(churchId: string, slug: string): Promise<any> {
    const sermon = await this.dataSource
      .getRepository('sermons')
      .findOne({
        where: {
          church_id: churchId,
          slug,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
      });

    if (!sermon) {
      throw new NotFoundException('Sermon not found');
    }

    // Increment view count asynchronously (non-blocking)
    this.incrementViewCount('sermons', sermon.id).catch((err) =>
      this.logger.error(`Failed to increment sermon view count: ${err.message}`),
    );

    return sermon;
  }

  /**
   * Get published events for a church (paginated, sorted by date)
   */
  async getPublishedEvents(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [events, total] = await this.dataSource
      .getRepository('events')
      .findAndCount({
        where: {
          church_id: churchId,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
        order: {
          event_date: 'ASC', // Upcoming events first
          created_at: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: events,
      total,
      page,
      limit,
    };
  }

  /**
   * Get a single event by slug
   */
  async getEventBySlug(churchId: string, slug: string): Promise<any> {
    const event = await this.dataSource
      .getRepository('events')
      .findOne({
        where: {
          church_id: churchId,
          slug,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
      });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Increment view count asynchronously
    this.incrementViewCount('events', event.id).catch((err) =>
      this.logger.error(`Failed to increment event view count: ${err.message}`),
    );

    return event;
  }

  /**
   * Get categories for a church
   */
  async getCategories(churchId: string): Promise<any[]> {
    return this.dataSource
      .getRepository('categories')
      .find({
        where: {
          church_id: churchId,
          deleted_at: null,
        },
        order: {
          name: 'ASC',
        },
      });
  }

  /**
   * Get published donation campaigns for a church (paginated)
   */
  async getPublishedDonationCampaigns(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [campaigns, total] = await this.dataSource
      .getRepository('donation_campaigns')
      .findAndCount({
        where: {
          church_id: churchId,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
        order: {
          published_at: 'DESC',
          created_at: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: campaigns,
      total,
      page,
      limit,
    };
  }

  /**
   * Get published spiritual resources (paginated)
   */
  async getPublishedSpiritualResources(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [resources, total] = await this.dataSource
      .getRepository('spiritual_resources')
      .findAndCount({
        where: {
          church_id: churchId,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
        order: {
          published_at: 'DESC',
          created_at: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: resources,
      total,
      page,
      limit,
    };
  }

  /**
   * Get published hymns (paginated)
   */
  async getPublishedHymns(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [hymns, total] = await this.dataSource
      .getRepository('hymns')
      .findAndCount({
        where: {
          church_id: churchId,
          status: ContentStatus.PUBLISHED,
          deleted_at: null,
        },
        order: {
          published_at: 'DESC',
          created_at: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: hymns,
      total,
      page,
      limit,
    };
  }

  /**
   * Get active radio stations for a church (paginated)
   */
  async getActiveRadioStations(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [stations, total] = await this.dataSource
      .getRepository('radio_stations')
      .findAndCount({
        where: {
          church_id: churchId,
          is_active: true,
          deleted_at: null,
        },
        order: {
          created_at: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: stations,
      total,
      page,
      limit,
    };
  }

  /**
   * Get active live streams for a church
   */
  async getActiveLiveStreams(
    churchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const now = new Date();

    // Live streams are active if they're scheduled for now or in the future,
    // or if they're currently streaming (started but not ended)
    const [streams, total] = await this.dataSource
      .getRepository('live_streams')
      .findAndCount({
        where: [
          {
            church_id: churchId,
            status: 'active',
            deleted_at: null,
          },
          {
            church_id: churchId,
            status: ContentStatus.PUBLISHED,
            scheduled_at: '>=' + now.toISOString(),
            deleted_at: null,
          },
        ],
        order: {
          scheduled_at: 'ASC',
          started_at: 'DESC',
        },
        skip,
        take: limit,
      });

    return {
      data: streams,
      total,
      page,
      limit,
    };
  }

  /**
   * Increment view count for content
   * Executed asynchronously to avoid blocking the response
   */
  private async incrementViewCount(
    tableName: string,
    contentId: string,
  ): Promise<void> {
    try {
      await this.dataSource
        .getRepository(tableName)
        .increment({ id: contentId }, 'view_count', 1);
    } catch (error) {
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error incrementing view count for ${tableName} ${contentId}:`,
        stack,
      );
    }
  }

  /**
   * Get paginated content with validation
   * Helper method for handling pagination parameters
   */
  validatePaginationParams(
    page?: number,
    limit?: number,
  ): { page: number; limit: number } {
    const validatedPage = Math.max(1, page || 1);
    const validatedLimit = Math.min(100, Math.max(1, limit || 10));

    return {
      page: validatedPage,
      limit: validatedLimit,
    };
  }
}
