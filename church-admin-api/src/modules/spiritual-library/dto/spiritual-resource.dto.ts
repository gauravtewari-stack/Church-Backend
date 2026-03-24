import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsArray,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
  ArrayMinSize,
  IsUUID,
} from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @IsEnum(['article', 'devotional', 'book', 'pdf'])
  @IsOptional()
  resource_type: 'article' | 'devotional' | 'book' | 'pdf' = 'article';

  @IsUrl()
  @IsOptional()
  file_url: string;

  @IsEnum(['draft', 'published', 'scheduled', 'archived'])
  @IsOptional()
  status: 'draft' | 'published' | 'scheduled' | 'archived' = 'draft';

  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @IsBoolean()
  @IsOptional()
  is_featured: boolean = false;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  seo_title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  seo_description: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  tags: string[] = [];
}

export class UpdateResourceDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @IsEnum(['article', 'devotional', 'book', 'pdf'])
  @IsOptional()
  resource_type: 'article' | 'devotional' | 'book' | 'pdf';

  @IsUrl()
  @IsOptional()
  file_url: string;

  @IsEnum(['draft', 'published', 'scheduled', 'archived'])
  @IsOptional()
  status: 'draft' | 'published' | 'scheduled' | 'archived';

  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @IsBoolean()
  @IsOptional()
  is_featured: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  seo_title: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  seo_description: string;

  @IsArray()
  @IsOptional()
  tags: string[];
}

export class ResourceQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(['article', 'devotional', 'book', 'pdf'])
  resource_type: 'article' | 'devotional' | 'book' | 'pdf';

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

export class PublishResourceDto {
  @IsDateString()
  @IsOptional()
  published_at: string;
}

export class ScheduleResourceDto {
  @IsDateString()
  @IsNotEmpty()
  scheduled_at: string;
}

export class BulkActionDto {
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @IsEnum(['publish', 'archive', 'draft', 'delete'])
  @IsNotEmpty()
  action: string;
}

export class ResourceStatsDto {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  featured: number;
  viewCount: number;
}
