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
import {
  UploadMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  BulkMediaActionDto,
  MediaResponseDto,
  MediaStatsDto,
} from './dto/media.dto';
import { MediaService } from './media.service';

@Controller('api/v1/media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
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
  async getStats(@Req() req: any): Promise<MediaStatsDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.getStats(churchId);
  }

  @Get('storage')
  async getStorageUsage(@Req() req: any): Promise<any> {
    const churchId = req.user?.church_id;
    return this.mediaService.getStorageUsage(churchId);
  }

  @Get('folders')
  async getFolders(@Req() req: any): Promise<string[]> {
    const churchId = req.user?.church_id;
    return this.mediaService.getFolders(churchId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.findOne(churchId, id);
  }

  @Get(':id/usages')
  async getUsages(@Param('id') id: string, @Req() req: any): Promise<any[]> {
    const churchId = req.user?.church_id;
    return this.mediaService.getUsages(churchId, id);
  }

  @Patch(':id')
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
  async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
    const churchId = req.user?.church_id;
    return this.mediaService.softDelete(churchId, id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: string, @Req() req: any): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.restore(churchId, id);
  }

  @Post(':id/archive')
  async archive(@Param('id') id: string, @Req() req: any): Promise<MediaResponseDto> {
    const churchId = req.user?.church_id;
    return this.mediaService.archive(churchId, id);
  }

  @Post('bulk-action')
  async bulkAction(
    @Body() dto: BulkMediaActionDto,
    @Req() req: any,
  ): Promise<{ success: number; failed: number; errors: Record<string, string> }> {
    const churchId = req.user?.church_id;
    return this.mediaService.bulkAction(churchId, dto.ids, dto.action);
  }
}
