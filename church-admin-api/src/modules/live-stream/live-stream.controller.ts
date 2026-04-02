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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LiveStreamService } from './live-stream.service';
import {
  CreateLiveStreamDto,
  UpdateLiveStreamDto,
  LiveStreamQueryDto,
  GoLiveDto,
  EndStreamDto,
} from './dto/live-stream.dto';

@ApiTags('Live Streams')
@ApiBearerAuth('Bearer')
@Controller('api/v1/live-streams')
export class LiveStreamController {
  constructor(private readonly liveStreamService: LiveStreamService) {}

  @Get()
  @ApiOperation({ summary: 'List all live streams with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Live streams retrieved successfully' })
  async findAll(@Request() req: any, @Query() query: LiveStreamQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findAll(churchId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new live stream' })
  @ApiResponse({ status: 201, description: 'Live stream created successfully' })
  async create(@Request() req: any, @Body() createDto: CreateLiveStreamDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.liveStreamService.create(churchId, createDto, userId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming scheduled streams' })
  @ApiResponse({ status: 200, description: 'Upcoming streams retrieved' })
  async getUpcoming(@Request() req: any, @Query('limit') limit?: number) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findUpcoming(churchId, limit);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get currently active streams' })
  @ApiResponse({ status: 200, description: 'Active streams retrieved' })
  async getActive(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findActive(churchId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recently ended streams' })
  @ApiResponse({ status: 200, description: 'Recent streams retrieved' })
  async getRecent(@Request() req: any, @Query('limit') limit?: number) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findRecent(churchId, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get live stream statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.getStats(churchId);
  }

  @Get('empty-state')
  @ApiOperation({ summary: 'Get empty state configuration' })
  @ApiResponse({ status: 200, description: 'Empty state retrieved' })
  async getEmptyState() {
    return this.liveStreamService.getEmptyState();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single live stream by ID' })
  @ApiResponse({ status: 200, description: 'Live stream retrieved' })
  @ApiResponse({ status: 404, description: 'Live stream not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.findOne(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a live stream' })
  @ApiResponse({ status: 200, description: 'Live stream updated' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateLiveStreamDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.update(churchId, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a live stream (soft delete)' })
  @ApiResponse({ status: 204, description: 'Live stream deleted' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.liveStreamService.remove(churchId, id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted live stream' })
  @ApiResponse({ status: 200, description: 'Live stream restored' })
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.restore(churchId, id);
  }

  @Patch(':id/go-live')
  @ApiOperation({ summary: 'Start a live stream' })
  @ApiResponse({ status: 200, description: 'Stream is now live' })
  async goLive(@Request() req: any, @Param('id') id: string, @Body() goLiveDto?: GoLiveDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.goLive(churchId, id, goLiveDto);
  }

  @Patch(':id/end')
  @ApiOperation({ summary: 'End a live stream' })
  @ApiResponse({ status: 200, description: 'Stream ended' })
  async endStream(@Request() req: any, @Param('id') id: string, @Body() endDto?: EndStreamDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.endStream(churchId, id, endDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a live stream' })
  @ApiResponse({ status: 200, description: 'Stream archived' })
  async archive(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.liveStreamService.archive(churchId, id);
  }

  @Patch(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment live stream view count' })
  @ApiResponse({ status: 204, description: 'View count incremented' })
  async incrementView(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.liveStreamService.incrementViewCount(churchId, id);
  }
}
