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
import { MediaType, MediaStatus } from '../entities/media.entity';

export class UploadMediaDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class MediaQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MediaType)
  media_type?: MediaType;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsEnum(MediaStatus)
  status?: MediaStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'title', 'file_size'])
  sort_by?: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsString()
  includeDeleted?: string;
}

export class BulkMediaActionDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsString()
  @IsIn(['archive', 'restore', 'delete'])
  action: 'archive' | 'restore' | 'delete';
}

export class MediaResponseDto {
  id: string;
  church_id: string;
  title: string;
  original_filename: string;
  file_url: string;
  mime_type: string;
  file_size: bigint;
  media_type: MediaType;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  description: string | null;
  tags: string[];
  alt_text: string | null;
  usage_count: number;
  folder: string | null;
  status: MediaStatus;
  created_at: Date;
  updated_at: Date;
  uploaded_by: string;
}

export class MediaUsageResponseDto {
  id: string;
  media_id: string;
  entity_type: string;
  entity_id: string;
  field_name: string;
  created_at: Date;
}

export class StorageUsageDto {
  total_bytes: bigint;
  total_files: number;
  by_type: {
    [key in MediaType]: {
      count: number;
      bytes: bigint;
    };
  };
}

export class MediaStatsDto {
  total_files: number;
  total_storage_bytes: bigint;
  by_type: {
    [key in MediaType]: number;
  };
  recent_uploads: MediaResponseDto[];
}
