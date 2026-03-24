import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsArray,
  IsDate,
  IsEnum,
  MinLength,
  MaxLength,
  Min,
  IsUrl,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContentStatus } from '../../../common/enums';

export class CreateSermonDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  speaker_name?: string;

  @IsOptional()
  @IsString()
  speaker_title?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sermon_date?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_minutes?: number;

  @IsOptional()
  @IsUrl()
  featured_image_url?: string;

  @IsOptional()
  @IsUrl()
  video_url?: string;

  @IsOptional()
  @IsUrl()
  audio_url?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean = false;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  category_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  media_ids?: string[];
}

export class UpdateSermonDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  speaker_name?: string;

  @IsOptional()
  @IsString()
  speaker_title?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  sermon_date?: Date;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration_minutes?: number;

  @IsOptional()
  @IsUrl()
  featured_image_url?: string;

  @IsOptional()
  @IsUrl()
  video_url?: string;

  @IsOptional()
  @IsUrl()
  audio_url?: string;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  seo_title?: string;

  @IsOptional()
  @IsString()
  seo_description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  category_ids?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  media_ids?: string[];
}

export class SermonQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsString()
  speaker_name?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  from_date?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  to_date?: Date;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  @IsOptional()
  @IsString()
  sort_by?: 'created_at' | 'published_at' | 'sermon_date' | 'view_count' | 'title' =
    'created_at';

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  include_relations?: boolean = false;
}

export class DuplicateSermonDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title_suffix?: string = '(Copy)';
}

export class BulkActionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];

  @IsEnum(['publish', 'archive', 'delete', 'restore', 'feature', 'unfeature'])
  action: string;

  @ValidateIf((o) => o.action === 'schedule')
  @IsDate()
  @Type(() => Date)
  scheduled_at?: Date;
}

export class PublishSermonDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  published_at?: Date;
}

export class ScheduleSermonDto {
  @IsDate()
  @Type(() => Date)
  scheduled_at: Date;
}
