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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ description: 'Resource title', example: 'Finding Peace in Prayer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Resource description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'Resource content (HTML or markdown)', example: '<p>Prayer is a powerful tool...</p>' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  category_id: string;

  @ApiPropertyOptional({ description: 'Short summary', example: 'A guide to developing a meaningful prayer life' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary: string;

  @ApiPropertyOptional({ description: 'Author name', example: 'Pastor John' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @ApiPropertyOptional({ description: 'Resource type', enum: ['article', 'devotional', 'book', 'pdf', 'devotional', 'prayer_guide', 'study'], default: 'article' })
  @IsString()
  @IsOptional()
  resource_type: string = 'article';

  @ApiPropertyOptional({ description: 'File URL for downloadable resources' })
  @IsUrl()
  @IsOptional()
  file_url: string;

  @ApiPropertyOptional({ description: 'Status', default: 'active' })
  @IsString()
  @IsOptional()
  status: string = 'active';

  @ApiPropertyOptional({ description: 'Published date (ISO string)' })
  @IsString()
  @IsOptional()
  published_date: string;

  @ApiPropertyOptional({ description: 'Scheduled publication date' })
  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @ApiPropertyOptional({ description: 'Featured flag', default: false })
  @IsBoolean()
  @IsOptional()
  is_featured: boolean = false;

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  seo_title: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  seo_description: string;

  @ApiPropertyOptional({ description: 'Tags', example: ['prayer', 'devotional'], default: [] })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  tags: string[] = [];
}

export class UpdateResourceDto {
  @ApiPropertyOptional({ description: 'Resource title' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Resource description' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiPropertyOptional({ description: 'Resource content' })
  @IsString()
  @IsOptional()
  @MinLength(10)
  content: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @IsUUID()
  @IsOptional()
  category_id: string;

  @ApiPropertyOptional({ description: 'Short summary' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary: string;

  @ApiPropertyOptional({ description: 'Author name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @ApiPropertyOptional({ description: 'Resource type' })
  @IsString()
  @IsOptional()
  resource_type: string;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsUrl()
  @IsOptional()
  file_url: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsString()
  @IsOptional()
  status: string;

  @ApiPropertyOptional({ description: 'Published date' })
  @IsString()
  @IsOptional()
  published_date: string;

  @ApiPropertyOptional({ description: 'Scheduled date' })
  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @ApiPropertyOptional({ description: 'Featured flag' })
  @IsBoolean()
  @IsOptional()
  is_featured: boolean;

  @ApiPropertyOptional({ description: 'SEO title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  seo_title: string;

  @ApiPropertyOptional({ description: 'SEO description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  seo_description: string;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsArray()
  @IsOptional()
  tags: string[];
}

export class ResourceQueryDto {
  @ApiPropertyOptional({ description: 'Search by title or content' })
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional({ description: 'Filter by type', enum: ['article', 'devotional', 'book', 'pdf'] })
  @IsOptional()
  @IsEnum(['article', 'devotional', 'book', 'pdf'])
  resource_type: 'article' | 'devotional' | 'book' | 'pdf';

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['draft', 'published', 'scheduled', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'published', 'scheduled', 'archived'])
  status: 'draft' | 'published' | 'scheduled' | 'archived';

  @ApiPropertyOptional({ description: 'Filter by featured' })
  @IsOptional()
  @IsBoolean()
  is_featured: boolean;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag: string;

  @ApiPropertyOptional({ description: 'Sort field', default: '-published_at' })
  @IsOptional()
  @IsString()
  sort: string = '-published_at';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit: number = 10;
}

export class PublishResourceDto {
  @ApiPropertyOptional({ description: 'Publication date (defaults to now)' })
  @IsDateString()
  @IsOptional()
  published_at: string;
}

export class ScheduleResourceDto {
  @ApiProperty({ description: 'Scheduled publication date' })
  @IsDateString()
  @IsNotEmpty()
  scheduled_at: string;
}

export class BulkActionDto {
  @ApiProperty({ description: 'List of resource IDs' })
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['publish', 'archive', 'draft', 'delete'] })
  @IsEnum(['publish', 'archive', 'draft', 'delete'])
  @IsNotEmpty()
  action: string;
}

export class ResourceStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() published: number;
  @ApiProperty() draft: number;
  @ApiProperty() scheduled: number;
  @ApiProperty() archived: number;
  @ApiProperty() featured: number;
  @ApiProperty() viewCount: number;
}
