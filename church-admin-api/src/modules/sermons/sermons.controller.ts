import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { CurrentChurch } from '../../common/decorators/current-church.decorator';
import { SermonsService } from './sermons.service';
import {
  CreateSermonDto,
  UpdateSermonDto,
  SermonQueryDto,
  DuplicateSermonDto,
  BulkActionDto,
  PublishSermonDto,
  ScheduleSermonDto,
} from './dto/sermon.dto';
import { Sermon } from './entities/sermon.entity';

@ApiTags('Sermons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/sermons')
export class SermonsController {
  constructor(private sermonsService: SermonsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sermon' })
  async create(
    @Body() createSermonDto: CreateSermonDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.create(churchId, createSermonDto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sermons with filters and search' })
  async findAll(
    @Query() queryDto: SermonQueryDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ items: Sermon[]; meta: any }> {
    return this.sermonsService.findAll(churchId, queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get sermon statistics for dashboard' })
  async getStats(@CurrentChurch() churchId: string): Promise<any> {
    return this.sermonsService.getStats(churchId);
  }

  @Get('empty-state')
  @ApiOperation({ summary: 'Get empty state information' })
  async getEmptyState(@CurrentChurch() churchId: string): Promise<any> {
    return this.sermonsService.getEmptyState(churchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sermon by ID' })
  async findOne(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
  ): Promise<Sermon> {
    return this.sermonsService.findOne(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sermon' })
  async update(
    @Param('id') id: string,
    @Body() updateSermonDto: UpdateSermonDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.update(churchId, id, updateSermonDto, user.sub);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a sermon' })
  async publish(
    @Param('id') id: string,
    @Body() publishDto: PublishSermonDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.publish(churchId, id, user.sub);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule a sermon for future publishing' })
  async schedule(
    @Param('id') id: string,
    @Body() scheduleDto: ScheduleSermonDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.schedule(
      churchId,
      id,
      scheduleDto.scheduled_at,
      user.sub,
    );
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a sermon' })
  async archive(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.archive(churchId, id, user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a sermon' })
  async softDelete(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<void> {
    return this.sermonsService.softDelete(churchId, id, user.sub);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted sermon' })
  async restore(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.restore(churchId, id, user.sub);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a sermon' })
  async duplicate(
    @Param('id') id: string,
    @Body() duplicateDto: DuplicateSermonDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Sermon> {
    return this.sermonsService.duplicate(churchId, id, duplicateDto, user.sub);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk actions on sermons' })
  async bulkAction(
    @Body() bulkActionDto: BulkActionDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<{ success: number; failed: number }> {
    return this.sermonsService.bulkAction(churchId, bulkActionDto, user.sub);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Increment sermon view count' })
  async incrementView(@Param('id') id: string): Promise<void> {
    return this.sermonsService.incrementViewCount(id);
  }
}
