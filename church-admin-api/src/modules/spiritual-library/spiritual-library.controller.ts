import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SpiritualLibraryService } from './spiritual-library.service';
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceQueryDto,
  PublishResourceDto,
  ScheduleResourceDto,
  BulkActionDto,
} from './dto/spiritual-resource.dto';

// Import your auth guard here - adjust based on your auth setup
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/v1/spiritual-library')
// @UseGuards(JwtAuthGuard)
export class SpiritualLibraryController {
  constructor(private readonly spiritualLibraryService: SpiritualLibraryService) {}

  /**
   * GET /api/v1/spiritual-library
   * List all resources with pagination and filters
   */
  @Get()
  async findAll(@Request() req: any, @Query() query: ResourceQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.findAll(churchId, query);
  }

  /**
   * POST /api/v1/spiritual-library
   * Create new resource
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createDto: CreateResourceDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.spiritualLibraryService.create(churchId, createDto, userId);
  }

  /**
   * GET /api/v1/spiritual-library/stats
   * Get statistics
   */
  @Get('stats')
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.getStats(churchId);
  }

  /**
   * GET /api/v1/spiritual-library/empty-state
   * Get empty state
   */
  @Get('empty-state')
  async getEmptyState() {
    return this.spiritualLibraryService.getEmptyState();
  }

  /**
   * GET /api/v1/spiritual-library/:id
   * Get single resource
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.findOne(churchId, id);
  }

  /**
   * PATCH /api/v1/spiritual-library/:id
   * Update resource
   */
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateResourceDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.update(churchId, id, updateDto);
  }

  /**
   * DELETE /api/v1/spiritual-library/:id
   * Delete resource (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.spiritualLibraryService.remove(churchId, id);
  }

  /**
   * PATCH /api/v1/spiritual-library/:id/restore
   * Restore soft deleted resource
   */
  @Patch(':id/restore')
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.restore(churchId, id);
  }

  /**
   * PATCH /api/v1/spiritual-library/:id/publish
   * Publish resource
   */
  @Patch(':id/publish')
  async publish(
    @Request() req: any,
    @Param('id') id: string,
    @Body() publishDto?: PublishResourceDto,
  ) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.publish(churchId, id, publishDto);
  }

  /**
   * PATCH /api/v1/spiritual-library/:id/schedule
   * Schedule resource for publishing
   */
  @Patch(':id/schedule')
  async schedule(@Request() req: any, @Param('id') id: string, @Body() scheduleDto: ScheduleResourceDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.schedule(churchId, id, scheduleDto);
  }

  /**
   * PATCH /api/v1/spiritual-library/:id/archive
   * Archive resource
   */
  @Patch(':id/archive')
  async archive(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.archive(churchId, id);
  }

  /**
   * POST /api/v1/spiritual-library/:id/duplicate
   * Duplicate resource
   */
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.duplicate(churchId, id);
  }

  /**
   * POST /api/v1/spiritual-library/bulk-action
   * Perform bulk action
   */
  @Post('bulk-action')
  async bulkAction(@Request() req: any, @Body() bulkDto: BulkActionDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.bulkAction(churchId, bulkDto);
  }

  /**
   * PATCH /api/v1/spiritual-library/:id/view
   * Increment view count
   */
  @Patch(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementView(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.spiritualLibraryService.incrementViewCount(churchId, id);
  }
}
