import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  MinLength,
  MaxLength,
  ArrayMinSize,
  Min,
} from 'class-validator';

export class CreateHymnDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  lyrics: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  composer: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  hymn_number: number;

  @IsUrl()
  @IsOptional()
  audio_url: string;

  @IsUrl()
  @IsOptional()
  sheet_music_url: string;

  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @IsEnum(['draft', 'published', 'scheduled', 'archived'])
  @IsOptional()
  status: 'draft' | 'published' | 'scheduled' | 'archived' = 'draft';

  @IsDateString()
  @IsOptional()
  published_at: string;

  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @IsBoolean()
  @IsOptional()
  is_featured: boolean = false;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  tags: string[] = [];
}

export class UpdateHymnDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(20)
  lyrics: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  composer: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  hymn_number: number;

  @IsUrl()
  @IsOptional()
  audio_url: string;

  @IsUrl()
  @IsOptional()
  sheet_music_url: string;

  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @IsEnum(['draft', 'published', 'scheduled', 'archived'])
  @IsOptional()
  status: 'draft' | 'published' | 'scheduled' | 'archived';

  @IsDateString()
  @IsOptional()
  published_at: string;

  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @IsBoolean()
  @IsOptional()
  is_featured: boolean;

  @IsArray()
  @IsOptional()
  tags: string[];
}

export class HymnQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(['draft', 'published', 'scheduled', 'archived'])
  status: 'draft' | 'published' | 'scheduled' | 'archived';

  @IsOptional()
  @IsBoolean()
  is_featured: boolean;

  @IsOptional()
  @IsString()
  tag: string;

  @IsOptional()
  @IsString()
  sort: string = '-published_at';

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;
}

export class PublishHymnDto {
  @IsDateString()
  @IsOptional()
  published_at: string;
}

export class ScheduleHymnDto {
  @IsDateString()
  @IsNotEmpty()
  scheduled_at: string;
}

export class HymnBulkActionDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @IsEnum(['publish', 'archive', 'draft', 'delete'])
  @IsNotEmpty()
  action: string;
}

export class HymnStatsDto {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  featured: number;
  viewCount: number;
}
