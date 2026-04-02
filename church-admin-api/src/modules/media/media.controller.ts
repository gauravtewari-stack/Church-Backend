import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import {
  UploadMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  BulkMediaActionDto,
  MediaResponseDto,
  MediaStatsDto,
} from './dto/media.dto';
import { MediaService } from './media.service';

@ApiTags('Media')
@ApiBearerAuth('Bearer')
@Controller('api/v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: MediaResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file or missing data' })
  async upload(
    @UploadedFile() file: any,
    @Body() dto: UploadMediaDto,
    @Req() req: any,
  ): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    const userId = req.user?.id;

    return this.mediaService.upload(churchId, file, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media files with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Media files retrieved successfully' })
  async findAll(
    @Query() query: MediaQueryDto,
    @Req() req: any,
  ): Promise<{
    data: MediaResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const churchId = req.user?.church_id;
    return this.mediaService.findAll(churchId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get media statistics' })
  @ApiResponse({ status: 200, description: 'Media stats retrieved', type: MediaStatsDto })
  async getStats(@Req() req: any): Promise<MediaStatsDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.getStats(churchId);
  }

  @Get('storage')
  @ApiOperation({ summary: 'Get storage usage breakdown' })
  @ApiResponse({ status: 200, description: 'Storage usage retrieved' })
  async getStorageUsage(@Req() req: any): Promise<any> {
    const churchId = req.user?.church_id;
    return this.mediaService.getStorageUsage(churchId);
  }

  @Get('folders')
  @ApiOperation({ summary: 'Get all media folders' })
  @ApiResponse({ status: 200, description: 'Folders retrieved' })
  async getFolders(@Req() req: any): Promise<string[]> {
    const churchId = req.user?.church_id;
    return this.mediaService.getFolders(churchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single media file by ID' })
  @ApiResponse({ status: 200, description: 'Media file retrieved', type: MediaResponseDto })
  @ApiResponse({ status: 404, description: 'Media file not found' })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.findOne(churchId, id);
  }

  @Get(':id/usages')
  @ApiOperation({ summary: 'Get usage references for a media file' })
  @ApiResponse({ status: 200, description: 'Usages retrieved' })
  async getUsages(@Param('id') id: string, @Req() req: any): Promise<any[]> {
    const churchId = req.user?.church_id;
    return this.mediaService.getUsages(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media file metadata' })
  @ApiResponse({ status: 200, description: 'Media file updated', type: MediaResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
    @Req() req: any,
  ): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.update(churchId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a media file (soft delete)' })
  @ApiResponse({ status: 204, description: 'Media file deleted' })
  async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
    const churchId = req.user?.church_id;
    return this.mediaService.softDelete(churchId, id);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted media file' })
  @ApiResponse({ status: 200, description: 'Media file restored', type: MediaResponseDto })
  async restore(@Param('id') id: string, @Req() req: any): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.restore(churchId, id);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a media file' })
  @ApiResponse({ status: 200, description: 'Media file archived', type: MediaResponseDto })
  async archive(@Param('id') id: string, @Req() req: any): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.archive(churchId, id);
  }

  @Post('bulk-action')
  @ApiOperation({ summary: 'Perform bulk action on media files' })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(
    @Body() dto: BulkMediaActionDto,
    @Req() req: any,
  ): Promise<{ success: number; failed: number; errors: Record<string, string> }> {
    const churchId = req.user?.church_id;
    return this.mediaService.bulkAction(churchId, dto.ids, dto.action);
  }
}
