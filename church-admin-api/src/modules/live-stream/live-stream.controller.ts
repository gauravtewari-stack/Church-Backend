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
import { LiveStreamService } from './live-stream.service';
import {
  CreateLiveStreamDto,
  UpdateLiveStreamDto,
  LiveStreamQueryDto,
  GoLiveDto,
  EndStreamDto,
} from './dto/live-stream.dto';

// Import your auth guard here - adjust based on your auth setup
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/v1/live-streams')
// @UseGuards(JwtAuthGuard)
export class LiveStreamController {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  /**
   * GET /api/v1/live-streams
   * List all live streams with pagination and filters
   */
  @Get()
  async findAll(@Request() req: any, @Query() query: LiveStreamQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findAll(churchId, query);
  }

  /**
   * POST /api/v1/live-streams
   * Create new live stream
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createDto: CreateLiveStreamDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.liveStreamService.create(churchId, createDto, userId);
  }

  /**
   * GET /api/v1/live-streams/upcoming
   * Get upcoming scheduled streams
   */
  @Get('upcoming')
  async getUpcoming(@Request() req: any, @Query('limit') limit?: number) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findUpcoming(churchId, limit);
  }

  /**
   * GET /api/v1/live-streams/active
   * Get currently active streams
   */
  @Get('active')
  async getActive(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findActive(churchId);
  }

  /**
   * GET /api/v1/live-streams/recent
   * Get recently ended streams
   */
  @Get('recent')
  async getRecent(@Request() req: any, @Query('limit') limit?: number) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findRecent(churchId, limit);
  }

  /**
   * GET /api/v1/live-streams/stats
   * Get statistics
   */
  @Get('stats')
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.getStats(churchId);
  }

  /**
   * GET /api/v1/live-streams/empty-state
   * Get empty state
   */
  @Get('empty-state')
  async getEmptyState() {
    return this.liveStreamService.getEmptyState();
  }

  /**
   * GET /api/v1/live-streams/:id
   * Get single live stream
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findOne(churchId, id);
  }

  /**
   * PATCH /api/v1/live-streams/:id
   * Update live stream
   */
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLiveStreamDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.update(churchId, id, updateDto);
  }

  /**
   * DELETE /api/v1/live-streams/:id
   * Delete live stream (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.liveStreamService.remove(churchId, id);
  }

  /**
   * PATCH /api/v1/live-streams/:id/restore
   * Restore soft deleted live stream
   */
  @Patch(':id/restore')
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.restore(churchId, id);
  }

  /**
   * PATCH /api/v1/live-streams/:id/go-live
   * Start live stream
   */
  @Patch(':id/go-live')
  async goLive(@Request() req: any, @Param('id') id: string, @Body() goLiveDto?: GoLiveDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.goLive(churchId, id, goLiveDto);
  }

  /**
   * PATCH /api/v1/live-streams/:id/end
   * End live stream
   */
  @Patch(':id/end')
  async endStream(@Request() req: any, @Param('id') id: string, @Body() endDto?: EndStreamDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.endStream(churchId, id, endDto);
  }

  /**
   * PATCH /api/v1/live-streams/:id/archive
   * Archive live stream
   */
  @Patch(':id/archive')
  async archive(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.archive(churchId, id);
  }

  /**
   * PATCH /api/v1/live-streams/:id/view
   * Increment view count
   */
  @Patch(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async incrementView(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.liveStreamService.incrementViewCount(churchId, id);
  }
}
