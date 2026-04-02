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
import { SpiritualLibraryService } from './spiritual-library.service';
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceQueryDto,
  PublishResourceDto,
  ScheduleResourceDto,
  BulkActionDto,
} from './dto/spiritual-resource.dto';

@ApiTags('Spiritual Library')
@ApiBearerAuth('Bearer')
@Controller('api/v1/spiritual-library')
export class SpiritualLibraryController {
  constructor(private readonly spiritualLibraryService: SpiritualLibraryService) {}

  @Get()
  @ApiOperation({ summary: 'List all spiritual resources with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Resources retrieved successfully' })
  async findAll(@Request() req: any, @Query() query: ResourceQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.findAll(churchId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new spiritual resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  async create(@Request() req: any, @Body() createDto: CreateResourceDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.spiritualLibraryService.create(churchId, createDto, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get spiritual library statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.getStats(churchId);
  }

  @Get('empty-state')
  @ApiOperation({ summary: 'Get empty state configuration' })
  @ApiResponse({ status: 200, description: 'Empty state retrieved' })
  async getEmptyState() {
    return this.spiritualLibraryService.getEmptyState();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single spiritual resource by ID' })
  @ApiResponse({ status: 200, description: 'Resource retrieved' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.findOne(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a spiritual resource' })
  @ApiResponse({ status: 200, description: 'Resource updated' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateResourceDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.update(churchId, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a spiritual resource (soft delete)' })
  @ApiResponse({ status: 204, description: 'Resource deleted' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.spiritualLibraryService.remove(churchId, id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted resource' })
  @ApiResponse({ status: 200, description: 'Resource restored' })
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.restore(churchId, id);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publish a spiritual resource' })
  @ApiResponse({ status: 200, description: 'Resource published' })
  async publish(
    @Request() req: any,
    @Param('id') id: string,
    @Body() publishDto?: PublishResourceDto,
  ) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.publish(churchId, id, publishDto);
  }

  @Patch(':id/schedule')
  @ApiOperation({ summary: 'Schedule a resource for publishing' })
  @ApiResponse({ status: 200, description: 'Resource scheduled' })
  async schedule(@Request() req: any, @Param('id') id: string, @Body() scheduleDto: ScheduleResourceDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.schedule(churchId, id, scheduleDto);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive a spiritual resource' })
  @ApiResponse({ status: 200, description: 'Resource archived' })
  async archive(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.archive(churchId, id);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Duplicate a spiritual resource' })
  @ApiResponse({ status: 201, description: 'Resource duplicated' })
  async duplicate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.duplicate(churchId, id);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on resources' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(@Request() req: any, @Body() bulkDto: BulkActionDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.spiritualLibraryService.bulkAction(churchId, bulkDto);
  }

  @Patch(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment resource view count' })
  @ApiResponse({ status: 204, description: 'View count incremented' })
  async incrementView(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.spiritualLibraryService.incrementViewCount(churchId, id);
  }
}
