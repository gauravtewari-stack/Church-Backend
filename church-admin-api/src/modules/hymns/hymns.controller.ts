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
import { HymnsService } from './hymns.service';
import {
  CreateHymnDto,
  UpdateHymnDto,
  HymnQueryDto,
  PublishHymnDto,
  ScheduleHymnDto,
  HymnBulkActionDto,
} from './dto/hymn.dto';

// Import your auth guard here - adjust based on your auth setup
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/v1/hymns')
// @UseGuards(JwtAuthGuard)
export class HymnsController {
  constructor(private readonly hymnsService: HymnsService) {}

  /**
   * GET /api/v1/hymns
   * List all hymns with pagination and filters
   */
  @Get()
  async findAll(@Request() req: any, @Query() query: HymnQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.findAll(churchId, query);
  }

  /**
   * POST /api/v1/hymns
   * Create new hymn
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createDto: CreateHymnDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.hymnsService.create(churchId, createDto, userId);
  }

  /**
   * GET /api/v1/hymns/stats
   * Get statistics
   */
  @Get('stats')
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.getStats(churchId);
  }

  /**
   * GET /api/v1/hymns/empty-state
   * Get empty state
   */
  @Get('empty-state')
  async getEmptyState() {
    return this.hymnsService.getEmptyState();
  }

  /**
   * GET /api/v1/hymns/:id
   * Get single hymn
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.findOne(churchId, id);
  }

  /**
   * PATCH /api/v1/hymns/:id
   * Update hymn
   */
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateHymnDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.update(churchId, id, updateDto);
  }

  /**
   * DELETE /api/v1/hymns/:id
   * Delete hymn (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.hymnsService.remove(churchId, id);
  }

  /**
   * PATCH /api/v1/hymns/:id/restore
   * Restore soft deleted hymn
   */
  @Patch(':id/restore')
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.restore(churchId, id);
  }

  /**
   * PATCH /api/v1/hymns/:id/publish
   * Publish hymn
   */
  @Patch(':id/publish')
  async publish(
    @Request() req: any,
    @Param('id') id: string,
    @Body() publishDto?: PublishHymnDto,
  ) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.publish(churchId, id, publishDto);
  }

  /**
   * PATCH /api/v1/hymns/:id/schedule
   * Schedule hymn for publishing
   */
  @Patch(':id/schedule')
  async schedule(@Request() req: any, @Param('id') id: string, @Body() scheduleDto: ScheduleHymnDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.schedule(churchId, id, scheduleDto);
  }

  /**
   * PATCH /api/v1/hymns/:id/archive
   * Archive hymn
   */
  @Patch(':id/archive')
  async archive(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.archive(churchId, id);
  }

  /**
   * POST /api/v1/hymns/:id/duplicate
   * Duplicate hymn
   */
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.duplicate(churchId, id);
  }

  /**
   * POST /api/v1/hymns/bulk-action
   * Perform bulk action
   */
  @Post('bulk-action')
  async bulkAction(@Request() req: any, @Body() bulkDto: HymnBulkActionDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.bulkAction(churchId, bulkDto);
  }

  /**
   * PATCH /api/v1/hymns/:id/view
   * Increment view count
   */
  @Patch(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementView(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.hymnsService.incrementViewCount(churchId, id);
  }
}
