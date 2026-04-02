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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHymnDto {
  @ApiProperty({ description: 'Hymn title', example: 'Amazing Grace' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Hymn lyrics', example: 'Amazing grace, how sweet the sound...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  lyrics: string;

  @ApiPropertyOptional({ description: 'Author name', example: 'John Newton' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @ApiPropertyOptional({ description: 'Composer name', example: 'William Walker' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  composer: string;

  @ApiPropertyOptional({ description: 'Hymn number in hymnal', example: '1' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  hymn_number: string;

  @ApiPropertyOptional({ description: 'Musical key', example: 'G Major' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  key: string;

  @ApiPropertyOptional({ description: 'Tempo', example: 'Moderately Slow' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tempo: string;

  @ApiPropertyOptional({ description: 'Audio file URL', example: 'https://example.com/audio/amazing-grace.mp3' })
  @IsUrl()
  @IsOptional()
  audio_url: string;

  @ApiPropertyOptional({ description: 'MIDI file URL' })
  @IsUrl()
  @IsOptional()
  midi_url: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @ApiPropertyOptional({ description: 'Publication status', enum: ['draft', 'published', 'scheduled', 'archived', 'active', 'inactive'], default: 'active' })
  @IsString()
  @IsOptional()
  status: string = 'active';

  @ApiPropertyOptional({ description: 'Publication date' })
  @IsDateString()
  @IsOptional()
  published_at: string;

  @ApiPropertyOptional({ description: 'Scheduled publication date' })
  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @ApiPropertyOptional({ description: 'Whether this is a featured hymn', default: false })
  @IsBoolean()
  @IsOptional()
  is_featured: boolean = false;

  @ApiPropertyOptional({ description: 'Tags', example: ['worship', 'classic'], default: [] })
  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  tags: string[] = [];
}

export class UpdateHymnDto {
  @ApiPropertyOptional({ description: 'Hymn title' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Hymn lyrics' })
  @IsString()
  @IsOptional()
  @MinLength(20)
  lyrics: string;

  @ApiPropertyOptional({ description: 'Author name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  author: string;

  @ApiPropertyOptional({ description: 'Composer name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  composer: string;

  @ApiPropertyOptional({ description: 'Hymn number' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  hymn_number: string;

  @ApiPropertyOptional({ description: 'Musical key' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  key: string;

  @ApiPropertyOptional({ description: 'Tempo' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  tempo: string;

  @ApiPropertyOptional({ description: 'Audio file URL' })
  @IsUrl()
  @IsOptional()
  audio_url: string;

  @ApiPropertyOptional({ description: 'MIDI file URL' })
  @IsUrl()
  @IsOptional()
  midi_url: string;

  @ApiPropertyOptional({ description: 'Featured image URL' })
  @IsUrl()
  @IsOptional()
  featured_image_url: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsString()
  @IsOptional()
  status: string;

  @ApiPropertyOptional({ description: 'Publication date' })
  @IsDateString()
  @IsOptional()
  published_at: string;

  @ApiPropertyOptional({ description: 'Scheduled publication date' })
  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @ApiPropertyOptional({ description: 'Featured flag' })
  @IsBoolean()
  @IsOptional()
  is_featured: boolean;

  @ApiPropertyOptional({ description: 'Tags' })
  @IsArray()
  @IsOptional()
  tags: string[];
}

export class HymnQueryDto {
  @ApiPropertyOptional({ description: 'Search by title or author' })
  @IsOptional()
  @IsString()
  search: string;

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

  @ApiPropertyOptional({ description: 'Sort field (prefix with - for descending)', default: '-published_at' })
  @IsOptional()
  @IsString()
  sort: string = '-published_at';

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  limit: number = 10;
}

export class PublishHymnDto {
  @ApiPropertyOptional({ description: 'Publication date (defaults to now)' })
  @IsDateString()
  @IsOptional()
  published_at: string;
}

export class ScheduleHymnDto {
  @ApiProperty({ description: 'Scheduled publication date' })
  @IsDateString()
  @IsNotEmpty()
  scheduled_at: string;
}

export class HymnBulkActionDto {
  @ApiProperty({ description: 'List of hymn IDs', example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsNotEmpty()
  ids: string[];

  @ApiProperty({ description: 'Action to perform', enum: ['publish', 'archive', 'draft', 'delete'] })
  @IsEnum(['publish', 'archive', 'draft', 'delete'])
  @IsNotEmpty()
  action: string;
}

export class HymnStatsDto {
  @ApiProperty() total: number;
  @ApiProperty() published: number;
  @ApiProperty() draft: number;
  @ApiProperty() scheduled: number;
  @ApiProperty() archived: number;
  @ApiProperty() featured: number;
  @ApiProperty() viewCount: number;
}
