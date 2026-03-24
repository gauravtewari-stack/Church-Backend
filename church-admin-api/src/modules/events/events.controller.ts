import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CurrentChurch } from '../../common/decorators/current-church.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
  BulkEventActionDto,
  PublishEventDto,
  ArchiveEventDto,
  DuplicateEventDto,
  EventStatsDto,
  EventResponseDto,
} from './dto/event.dto';
import { Event } from './entities/event.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@ApiTags('Events')
@ApiBearerAuth()
@Controller('api/v1/events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Create a new event
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: Event,
  })
  async create(
    @Body() createEventDto: CreateEventDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.create(
      churchId,
      createEventDto,
      user?.id,
    );

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Get all events with filters and pagination
   */
  @Get()
  @ApiOperation({ summary: 'Get all events with filters and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() queryDto: EventQueryDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: PaginatedResponseDto<Event> }> {
    const result = await this.eventsService.findAll(churchId, queryDto);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get event statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiResponse({
    status: 200,
    description: 'Event statistics retrieved successfully',
    type: EventStatsDto,
  })
  async getStats(
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: EventStatsDto }> {
    const stats = await this.eventsService.getStats(churchId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get upcoming events
   */
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully',
    type: [Event],
  })
  async getUpcoming(
    @Query('limit') limit?: number,
    @CurrentChurch() churchId?: string,
  ): Promise<{ success: boolean; data: Event[] }> {
    const events = await this.eventsService.getUpcoming(
      churchId,
      limit || 5,
    );

    return {
      success: true,
      data: events,
    };
  }

  /**
   * Get a single event by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a single event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: Event,
  })
  async findOne(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.findOne(churchId, id);

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Update an event
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: Event,
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.update(
      churchId,
      id,
      updateEventDto,
      user?.id,
    );

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Publish an event
   */
  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish an event' })
  @ApiResponse({
    status: 200,
    description: 'Event published successfully',
    type: Event,
  })
  async publish(
    @Param('id') id: string,
    @Body() publishDto: PublishEventDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.publish(
      churchId,
      id,
      publishDto,
      user?.id,
    );

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Archive an event
   */
  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive an event' })
  @ApiResponse({
    status: 200,
    description: 'Event archived successfully',
    type: Event,
  })
  async archive(
    @Param('id') id: string,
    @Body() archiveDto: ArchiveEventDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.archive(
      churchId,
      id,
      user?.id,
    );

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Delete (soft delete) an event
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an event (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  async delete(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; message: string }> {
    await this.eventsService.softDelete(churchId, id, user?.id);

    return {
      success: true,
      message: 'Event deleted successfully',
    };
  }

  /**
   * Restore a soft-deleted event
   */
  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted event' })
  @ApiResponse({
    status: 200,
    description: 'Event restored successfully',
    type: Event,
  })
  async restore(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.restore(churchId, id, user?.id);

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Duplicate an event
   */
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicate an event' })
  @ApiResponse({
    status: 201,
    description: 'Event duplicated successfully',
    type: Event,
  })
  async duplicate(
    @Param('id') id: string,
    @Body() duplicateDto: DuplicateEventDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: Event }> {
    const event = await this.eventsService.duplicate(
      churchId,
      id,
      duplicateDto,
      user?.id,
    );

    return {
      success: true,
      data: event,
    };
  }

  /**
   * Perform bulk actions on multiple events
   */
  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk actions on multiple events' })
  @ApiResponse({
    status: 200,
    description: 'Bulk action completed',
  })
  async bulkAction(
    @Body() bulkDto: BulkEventActionDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: { updated: number; failed: number } }> {
    const result = await this.eventsService.bulkAction(
      churchId,
      bulkDto,
      user?.id,
    );

    return {
      success: true,
      data: result,
    };
  }
}
