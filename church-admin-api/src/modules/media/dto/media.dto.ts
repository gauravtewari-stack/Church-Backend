import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType, MediaStatus } from '../entities/media.entity';

export class UploadMediaDto {
  @ApiProperty({ description: 'File title', example: 'Sunday Worship Banner' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'File description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['worship', 'banner'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Folder path', example: 'banners' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Alt text for accessibility', example: 'Sunday worship service banner image' })
  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ description: 'File title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'File description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Folder path' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Alt text' })
  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class MediaQueryDto {
  @ApiPropertyOptional({ description: 'Search by title or filename' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by media type', enum: MediaType })
  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @ApiPropertyOptional({ description: 'Filter by folder' })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: MediaStatus })
  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @ApiPropertyOptional({ description: 'Filter by tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort by field', enum: ['created_at', 'updated_at', 'title', 'file_size'], default: 'created_at' })
  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'title', 'file_size'])
  sort_by?: string = 'created_at';

  @ApiPropertyOptional({ description: 'Sort order', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Include soft-deleted files' })
  @IsOptional()
  @IsString()
  includeDeleted?: string;
}

export class BulkMediaActionDto {
  @ApiProperty({ description: 'List of media IDs' })
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['archive', 'restore', 'delete'] })
  @IsString()
  @IsIn(['archive', 'restore', 'delete'])
  action: 'archive' | 'restore' | 'delete';
}

export class MediaResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() church_id: string;
  @ApiProperty() title: string;
  @ApiProperty() original_filename: string;
  @ApiProperty() file_url: string;
  @ApiProperty() mime_type: string;
  @ApiProperty() file_size: bigint;
  @ApiProperty({ enum: MediaType }) media_type: MediaType;
  @ApiPropertyOptional() width: number | null;
  @ApiPropertyOptional() height: number | null;
  @ApiPropertyOptional() duration_seconds: number | null;
  @ApiPropertyOptional() thumbnail_url: string | null;
  @ApiPropertyOptional() description: string | null;
  @ApiProperty() tags: string[];
  @ApiPropertyOptional() alt_text: string | null;
  @ApiProperty() usage_count: number;
  @ApiPropertyOptional() folder: string | null;
  @ApiProperty({ enum: MediaStatus }) status: MediaStatus;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
  @ApiProperty() uploaded_by: string;
}

export class MediaUsageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() media_id: string;
  @ApiProperty() entity_type: string;
  @ApiProperty() entity_id: string;
  @ApiProperty() field_name: string;
  @ApiProperty() created_at: Date;
}

export class StorageUsageDto {
  @ApiProperty() total_bytes: bigint;
  @ApiProperty() total_files: number;
  @ApiProperty() by_type: {
    [key in MediaType]: {
      count: number;
      bytes: bigint;
    };
  };
}

export class MediaStatsDto {
  @ApiProperty() total_files: number;
  @ApiProperty() total_storage_bytes: bigint;
  @ApiProperty() by_type: {
    [key in MediaType]: number;
  };
  @ApiProperty({ type: [MediaResponseDto] }) recent_uploads: MediaResponseDto[];
}
