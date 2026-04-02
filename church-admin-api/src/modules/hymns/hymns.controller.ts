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
import { HymnsService } from './hymns.service';
import {
  CreateHymnDto,
  UpdateHymnDto,
  HymnQueryDto,
  PublishHymnDto,
  ScheduleHymnDto,
  HymnBulkActionDto,
} from './dto/hymn.dto';

@ApiTags('Hymns')
@ApiBearerAuth('Bearer')
@Controller('api/v1/hymns')
export class HymnsController {
  constructor(private readonly hymnsService: HymnsService) {}

  @Get()
  @ApiOperation({ summary: 'List all hymns with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Hymns retrieved successfully' })
  async findAll(@Request() req: any, @Query() query: HymnQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.findAll(churchId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new hymn' })
  @ApiResponse({ status: 201, description: 'Hymn created successfully' })
  async create(@Request() req: any, @Body() createDto: CreateHymnDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.hymnsService.create(churchId, createDto, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get hymn statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.getStats(churchId);
  }

  @Get('empty-state')
  @ApiOperation({ summary: 'Get empty state configuration' })
  @ApiResponse({ status: 200, description: 'Empty state retrieved' })
  async getEmptyState() {
    return this.hymnsService.getEmptyState();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single hymn by ID' })
  @ApiResponse({ status: 200, description: 'Hymn retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Hymn not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.findOne(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hymn' })
  @ApiResponse({ status: 200, description: 'Hymn updated successfully' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateHymnDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.update(churchId, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a hymn (soft delete)' })
  @ApiResponse({ status: 204, description: 'Hymn deleted successfully' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.hymnsService.remove(churchId, id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted hymn' })
  @ApiResponse({ status: 200, description: 'Hymn restored successfully' })
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.restore(churchId, id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a hymn' })
  @ApiResponse({ status: 200, description: 'Hymn published successfully' })
  async publish(
    @Request() req: any,
    @Param('id') id: string,
    @Body() publishDto?: PublishHymnDto,
  ) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.publish(churchId, id, publishDto);
  }

  @Patch(':id/schedule')
  @ApiOperation({ summary: 'Schedule a hymn for publishing' })
  @ApiResponse({ status: 200, description: 'Hymn scheduled successfully' })
  async schedule(@Request() req: any, @Param('id') id: string, @Body() scheduleDto: ScheduleHymnDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.schedule(churchId, id, scheduleDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a hymn' })
  @ApiResponse({ status: 200, description: 'Hymn archived successfully' })
  async archive(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.archive(churchId, id);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicate a hymn' })
  @ApiResponse({ status: 201, description: 'Hymn duplicated successfully' })
  async duplicate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.duplicate(churchId, id);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on hymns' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(@Request() req: any, @Body() bulkDto: HymnBulkActionDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.hymnsService.bulkAction(churchId, bulkDto);
  }

  @Patch(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment hymn view count' })
  @ApiResponse({ status: 204, description: 'View count incremented' })
  async incrementView(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.hymnsService.incrementViewCount(churchId, id);
  }
}
