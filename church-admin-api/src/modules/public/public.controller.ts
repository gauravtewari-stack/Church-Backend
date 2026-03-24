import {
  Controller,
  Get,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PublicService } from './public.service';

/**
 * Public Controller
 * Provides read-only endpoints for publicly accessible content
 * No authentication required - all endpoints are public
 */
@ApiTags('Public API')
@Controller('api/v1/public')
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(private readonly publicService: PublicService) {}

  /**
   * GET /api/v1/public/:churchSlug/sermons
   * Get published sermons for a church (paginated)
   */
  @Get(':churchSlug/sermons')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get published sermons' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published sermons',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async getSermons(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getPublishedSermons(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching sermons: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/sermons/:slug
   * Get a single sermon by slug
   */
  @Get(':churchSlug/sermons/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single sermon' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiParam({ name: 'slug', description: 'Sermon slug identifier' })
  @ApiResponse({
    status: 200,
    description: 'Sermon details',
  })
  @ApiResponse({
    status: 404,
    description: 'Sermon not found',
  })
  async getSermon(
    @Param('churchSlug') churchSlug: string,
    @Param('slug') slug: string,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      return this.publicService.getSermonBySlug(church.id, slug);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching sermon: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/events
   * Get published events for a church (paginated, sorted by date)
   */
  @Get(':churchSlug/events')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get published events' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published events',
  })
  async getEvents(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getPublishedEvents(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching events: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/events/:slug
   * Get a single event by slug
   */
  @Get(':churchSlug/events/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single event' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiParam({ name: 'slug', description: 'Event slug identifier' })
  @ApiResponse({
    status: 200,
    description: 'Event details',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  async getEvent(
    @Param('churchSlug') churchSlug: string,
    @Param('slug') slug: string,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      return this.publicService.getEventBySlug(church.id, slug);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching event: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/categories
   * Get all categories for a church
   */
  @Get(':churchSlug/categories')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get church categories' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
  })
  async getCategories(@Param('churchSlug') churchSlug: string) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      return this.publicService.getCategories(church.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching categories: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/donations/campaigns
   * Get published donation campaigns for a church
   */
  @Get(':churchSlug/donations/campaigns')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get published donation campaigns' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published donation campaigns',
  })
  async getDonationCampaigns(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getPublishedDonationCampaigns(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching donation campaigns: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/spiritual-library
   * Get published spiritual resources
   */
  @Get(':churchSlug/spiritual-library')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get published spiritual resources' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published spiritual resources',
  })
  async getSpiritualResources(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getPublishedSpiritualResources(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching spiritual resources: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/hymns
   * Get published hymns
   */
  @Get(':churchSlug/hymns')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get published hymns' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of published hymns',
  })
  async getHymns(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getPublishedHymns(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching hymns: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/radio
   * Get active radio stations
   */
  @Get(':churchSlug/radio')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active radio stations' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active radio stations',
  })
  async getRadioStations(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getActiveRadioStations(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching radio stations: ${message}`);
      throw error;
    }
  }

  /**
   * GET /api/v1/public/:churchSlug/live-streams/active
   * Get active live streams
   */
  @Get(':churchSlug/live-streams/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active live streams' })
  @ApiParam({ name: 'churchSlug', description: 'Church slug identifier' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active live streams',
  })
  async getLiveStreams(
    @Param('churchSlug') churchSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      const church = await this.publicService.getChurchBySlug(churchSlug);
      const pagination = this.publicService.validatePaginationParams(page, limit);
      return this.publicService.getActiveLiveStreams(
        church.id,
        pagination.page,
        pagination.limit,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error fetching live streams: ${message}`);
      throw error;
    }
  }
}
