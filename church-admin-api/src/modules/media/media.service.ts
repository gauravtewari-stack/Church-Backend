import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull, In, Like } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { Media, MediaType, MediaStatus } from './entities/media.entity';
import { MediaUsage } from './entities/media-usage.entity';
import {
  UploadMediaDto,
  UpdateMediaDto,
  MediaQueryDto,
  BulkMediaActionDto,
  MediaResponseDto,
  StorageUsageDto,
  MediaStatsDto,
} from './dto/media.dto';

const ALLOWED_MIME_TYPES = {
  [MediaType.IMAGE]: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  [MediaType.VIDEO]: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
  [MediaType.AUDIO]: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
  [MediaType.DOCUMENT]: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
};

const MAX_FILE_SIZES = {
  [MediaType.IMAGE]: 50 * 1024 * 1024, // 50MB
  [MediaType.VIDEO]: 500 * 1024 * 1024, // 500MB
  [MediaType.AUDIO]: 200 * 1024 * 1024, // 200MB
  [MediaType.DOCUMENT]: 100 * 1024 * 1024, // 100MB
};

const MIME_TYPE_TO_MEDIA_TYPE = {
  'image/jpeg': MediaType.IMAGE,
  'image/png': MediaType.IMAGE,
  'image/gif': MediaType.IMAGE,
  'image/webp': MediaType.IMAGE,
  'image/svg+xml': MediaType.IMAGE,
  'video/mp4': MediaType.VIDEO,
  'video/mpeg': MediaType.VIDEO,
  'video/quicktime': MediaType.VIDEO,
  'video/x-msvideo': MediaType.VIDEO,
  'audio/mpeg': MediaType.AUDIO,
  'audio/wav': MediaType.AUDIO,
  'audio/ogg': MediaType.AUDIO,
  'audio/flac': MediaType.AUDIO,
  'application/pdf': MediaType.DOCUMENT,
  'application/msword': MediaType.DOCUMENT,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': MediaType.DOCUMENT,
  'application/vnd.ms-excel': MediaType.DOCUMENT,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': MediaType.DOCUMENT,
};

@Injectable()
export class MediaService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(MediaUsage)
    private readonly mediaUsageRepository: Repository<MediaUsage>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async upload(
    churchId: string,
    file: any,
    dto: UploadMediaDto,
    userId: string,
  ): Promise<MediaResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const mimeType = file.mimetype;
    const mediaType = this.determineMediaType(mimeType);

    if (!mediaType) {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }

    const allowedTypes = ALLOWED_MIME_TYPES[mediaType];
    if (!allowedTypes.includes(mimeType)) {
      throw new BadRequestException(`File type ${mimeType} not allowed for ${mediaType}`);
    }

    const maxSize = MAX_FILE_SIZES[mediaType];
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxSize / 1024 / 1024}MB for ${mediaType}`,
      );
    }

    await this.ensureUploadsDirectory();
    const fileName = this.generateUniqueFileName(file.originalname);
    const filePath = path.join(this.uploadsDir, churchId, fileName);
    const fileUrl = `/uploads/${churchId}/${fileName}`;

    try {
      await this.ensureDirectoryExists(path.dirname(filePath));
      await fs.writeFile(filePath, file.buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to save file: ${message}`);
    }

    const media = this.mediaRepository.create({
      church_id: churchId,
      title: dto.title,
      file_name: file.originalname,
      file_path: filePath,
      url: fileUrl,
      mime_type: mimeType,
      file_size: file.size,
      file_type: mediaType,
      description: dto.description,
      tags: dto.tags || [],
      alt_text: dto.alt_text,
      folder: dto.folder,
      status: MediaStatus.ACTIVE,
      uploaded_by: userId,
      thumbnail_url: this.generateThumbnailUrl(mediaType, fileUrl),
    });

    const saved = await this.mediaRepository.save(media);
    return this.mapToResponseDto(saved);
  }

  async findAll(churchId: string, query: MediaQueryDto): Promise<{
    data: MediaResponseDto[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    let qb = this.mediaRepository.createQueryBuilder('media');

    qb = qb.where('media.church_id = :churchId', { churchId });

    if (query.includeDeleted !== 'true') {
      qb = qb.andWhere('media.deleted_at IS NULL');
    }

    if (query.search) {
      qb = qb.andWhere(
        '(media.title ILIKE :search OR media.description ILIKE :search OR media.file_name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.file_type) {
      qb = qb.andWhere('media.file_type = :fileType', { fileType: query.file_type });
    }

    if (query.folder) {
      qb = qb.andWhere('media.folder = :folder', { folder: query.folder });
    }

    if (query.status) {
      qb = qb.andWhere('media.status = :status', { status: query.status });
    }

    if (query.tags && query.tags.length > 0) {
      qb = qb.andWhere('media.tags && :tags', { tags: query.tags });
    }

    const total = await qb.getCount();

    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;

    const sortColumn = query.sort_by || 'created_at';
    const sortOrder = query.sort_order || 'DESC';

    qb = qb.orderBy(`media.${sortColumn}`, sortOrder as 'ASC' | 'DESC');
    qb = qb.skip(offset).take(limit);

    const data = await qb.getMany();
    const pages = Math.ceil(total / limit);

    return {
      data: data.map((m) => this.mapToResponseDto(m)),
      total,
      page,
      limit,
      pages,
    };
  }

  async findOne(churchId: string, id: string): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
        church_id: churchId,
        deleted_at: IsNull(),
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    return this.mapToResponseDto(media);
  }

  async update(churchId: string, id: string, dto: UpdateMediaDto): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
        church_id: churchId,
        deleted_at: IsNull(),
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (dto.title) media.title = dto.title;
    if (dto.description !== undefined) media.description = dto.description;
    if (dto.tags) media.tags = dto.tags;
    if (dto.folder !== undefined) media.folder = dto.folder;
    if (dto.alt_text !== undefined) media.alt_text = dto.alt_text;

    const updated = await this.mediaRepository.save(media);
    return this.mapToResponseDto(updated);
  }

  async softDelete(churchId: string, id: string): Promise<void> {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
        church_id: churchId,
        deleted_at: IsNull(),
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const usageCount = await this.mediaUsageRepository.count({
      where: { media_id: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot delete media that is in use (${usageCount} usages). Remove from all usages first.`,
      );
    }

    media.deleted_at = new Date();
    await this.mediaRepository.save(media);
  }

  async restore(churchId: string, id: string): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
        church_id: churchId,
      },
      withDeleted: true,
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    media.deleted_at = null;
    const updated = await this.mediaRepository.save(media);
    return this.mapToResponseDto(updated);
  }

  async archive(churchId: string, id: string): Promise<MediaResponseDto> {
    const media = await this.mediaRepository.findOne({
      where: {
        id,
        church_id: churchId,
        deleted_at: IsNull(),
      },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    media.status = MediaStatus.ARCHIVED;
    const updated = await this.mediaRepository.save(media);
    return this.mapToResponseDto(updated);
  }

  async bulkAction(
    churchId: string,
    ids: string[],
    action: 'archive' | 'restore' | 'delete',
  ): Promise<{ success: number; failed: number; errors: Record<string, string> }> {
    const results = { success: 0, failed: 0, errors: {} as Record<string, string> };

    for (const id of ids) {
      try {
        if (action === 'archive') {
          await this.archive(churchId, id);
        } else if (action === 'restore') {
          await this.restore(churchId, id);
        } else if (action === 'delete') {
          await this.softDelete(churchId, id);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors[id] = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    return results;
  }

  async trackUsage(
    mediaId: string,
    entityType: string,
    entityId: string,
    fieldName: string,
    churchId: string,
  ): Promise<void> {
    const existing = await this.mediaUsageRepository.findOne({
      where: { media_id: mediaId, entity_type: entityType, entity_id: entityId, field_name: fieldName },
    });

    if (existing) {
      return;
    }

    const usage = this.mediaUsageRepository.create({
      media_id: mediaId,
      entity_type: entityType,
      entity_id: entityId,
      field_name: fieldName,
      church_id: churchId,
    });

    await this.mediaUsageRepository.save(usage);

    const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
    if (media) {
      media.usage_count += 1;
      await this.mediaRepository.save(media);
    }
  }

  async removeUsage(mediaId: string, entityType: string, entityId: string): Promise<void> {
    const usages = await this.mediaUsageRepository.find({
      where: { media_id: mediaId, entity_type: entityType, entity_id: entityId },
    });

    if (usages.length > 0) {
      await this.mediaUsageRepository.remove(usages);

      const media = await this.mediaRepository.findOne({ where: { id: mediaId } });
      if (media) {
        media.usage_count = Math.max(0, media.usage_count - usages.length);
        await this.mediaRepository.save(media);
      }
    }
  }

  async getUsages(churchId: string, mediaId: string): Promise<Array<any>> {
    return this.mediaUsageRepository.find({
      where: { media_id: mediaId, church_id: churchId },
      order: { created_at: 'DESC' },
    });
  }

  async getStorageUsage(churchId: string): Promise<StorageUsageDto> {
    const result = await this.mediaRepository.query(
      `
      SELECT
        COALESCE(SUM(file_size), 0) as total_bytes,
        COUNT(*) as total_files,
        file_type,
        COUNT(*) as type_count,
        COALESCE(SUM(file_size), 0) as type_bytes
      FROM media
      WHERE church_id = $1 AND deleted_at IS NULL
      GROUP BY file_type
      `,
      [churchId],
    );

    const byType: any = {};
    let totalBytes = BigInt(0);
    let totalFiles = 0;

    for (const row of result) {
      byType[row.file_type] = {
        count: parseInt(row.type_count),
        bytes: BigInt(row.type_bytes),
      };
      totalBytes += BigInt(row.type_bytes);
      totalFiles += parseInt(row.type_count);
    }

    return {
      total_bytes: totalBytes,
      total_files: totalFiles,
      by_type: byType,
    };
  }

  async getFolders(churchId: string): Promise<string[]> {
    const folders = await this.mediaRepository
      .createQueryBuilder('media')
      .select('DISTINCT media.folder', 'folder')
      .where('media.church_id = :churchId', { churchId })
      .andWhere('media.deleted_at IS NULL')
      .andWhere('media.folder IS NOT NULL')
      .orderBy('media.folder', 'ASC')
      .getRawMany();

    return folders.map((f) => f.folder);
  }

  async getStats(churchId: string): Promise<MediaStatsDto> {
    const storage = await this.getStorageUsage(churchId);

    const byType = await this.mediaRepository.query(
      `
      SELECT file_type, COUNT(*) as count
      FROM media
      WHERE church_id = $1 AND deleted_at IS NULL
      GROUP BY file_type
      `,
      [churchId],
    );

    const typeMap: any = {};
    for (const row of byType) {
      typeMap[row.file_type] = parseInt(row.count);
    }

    const recent = await this.mediaRepository.find({
      where: { church_id: churchId, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      total_files: storage.total_files,
      total_storage_bytes: storage.total_bytes,
      by_type: typeMap,
      recent_uploads: recent.map((m) => this.mapToResponseDto(m)),
    };
  }

  private determineMediaType(mimeType: string): MediaType | null {
    return MIME_TYPE_TO_MEDIA_TYPE[mimeType] || null;
  }

  private generateUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName);
    return `${uuidv4()}${ext}`;
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create uploads directory: ${message}`);
    }
  }

  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to create directory: ${message}`);
    }
  }

  private generateThumbnailUrl(mediaType: MediaType, fileUrl: string): string | null {
    if (mediaType === MediaType.IMAGE) {
      return fileUrl.replace(/\.[^/.]+$/, '-thumb.jpg');
    }
    if (mediaType === MediaType.VIDEO) {
      return fileUrl.replace(/\.[^/.]+$/, '-thumb.jpg');
    }
    return null;
  }

  private mapToResponseDto(media: Media): MediaResponseDto {
    return {
      id: media.id,
      church_id: media.church_id,
      title: media.title,
      file_name: media.file_name,
      url: media.url,
      mime_type: media.mime_type,
      file_size: media.file_size,
      file_type: media.file_type,
      width: media.width,
      height: media.height,
      duration_seconds: media.duration_seconds,
      thumbnail_url: media.thumbnail_url,
      description: media.description,
      tags: media.tags,
      alt_text: media.alt_text,
      usage_count: media.usage_count,
      folder: media.folder,
      status: media.status,
      created_at: media.created_at,
      updated_at: media.updated_at,
      uploaded_by: media.uploaded_by,
    };
  }
}
