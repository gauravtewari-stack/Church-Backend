import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsBoolean,
  IsDateString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLiveStreamDto {
  @ApiProperty({ description: 'Stream title', example: 'Sunday Worship Service' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Stream description' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ description: 'Stream URL', example: 'https://youtube.com/live/abc123' })
  @IsUrl()
  @IsNotEmpty()
  stream_url: string;

  @ApiPropertyOptional({ description: 'Embed code for the stream' })
  @IsString()
  @IsOptional()
  embed_code: string;

  @ApiPropertyOptional({ description: 'Streaming platform', enum: ['youtube', 'facebook', 'vimeo', 'custom'], default: 'custom' })
  @IsEnum(['youtube', 'facebook', 'vimeo', 'custom'])
  @IsOptional()
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom' = 'custom';

  @ApiPropertyOptional({ description: 'Thumbnail image URL' })
  @IsUrl()
  @IsOptional()
  thumbnail_url: string;

  @ApiPropertyOptional({ description: 'Scheduled start time' })
  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @ApiPropertyOptional({ description: 'Linked event ID' })
  @IsUUID()
  @IsOptional()
  linked_event_id: string;

  @ApiPropertyOptional({ description: 'Featured flag', default: false })
  @IsBoolean()
  @IsOptional()
  is_featured: boolean = false;
}

export class UpdateLiveStreamDto {
  @ApiPropertyOptional({ description: 'Stream title' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ description: 'Stream description' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @ApiPropertyOptional({ description: 'Stream URL' })
  @IsUrl()
  @IsOptional()
  stream_url: string;

  @ApiPropertyOptional({ description: 'Embed code' })
  @IsString()
  @IsOptional()
  embed_code: string;

  @ApiPropertyOptional({ description: 'Platform', enum: ['youtube', 'facebook', 'vimeo', 'custom'] })
  @IsEnum(['youtube', 'facebook', 'vimeo', 'custom'])
  @IsOptional()
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom';

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsUrl()
  @IsOptional()
  thumbnail_url: string;

  @ApiPropertyOptional({ description: 'Scheduled time' })
  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @ApiPropertyOptional({ description: 'Status', enum: ['scheduled', 'live', 'ended', 'archived'] })
  @IsEnum(['scheduled', 'live', 'ended', 'archived'])
  @IsOptional()
  status: 'scheduled' | 'live' | 'ended' | 'archived';

  @ApiPropertyOptional({ description: 'Linked event ID' })
  @IsUUID()
  @IsOptional()
  linked_event_id: string;

  @ApiPropertyOptional({ description: 'Featured flag' })
  @IsBoolean()
  @IsOptional()
  is_featured: boolean;
}

export class LiveStreamQueryDto {
  @ApiPropertyOptional({ description: 'Search by title' })
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['scheduled', 'live', 'ended', 'archived'] })
  @IsOptional()
  @IsEnum(['scheduled', 'live', 'ended', 'archived'])
  status: 'scheduled' | 'live' | 'ended' | 'archived';

  @ApiPropertyOptional({ description: 'Filter by featured' })
  @IsOptional()
  @IsBoolean()
  is_featured: boolean;

  @ApiPropertyOptional({ description: 'Filter by platform' })
  @IsOptional()
  @IsString()
  platform: string;

  @ApiPropertyOptional({ description: 'Sort field', default: '-scheduled_at' })
  @IsOptional()
  @IsString()
  sort: string = '-scheduled_at';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit: number = 10;
}

export class GoLiveDto {
  @ApiPropertyOptional({ description: 'Stream start time (defaults to now)' })
  @IsDateString()
  @IsOptional()
  started_at: string;
}

export class EndStreamDto {
  @ApiPropertyOptional({ description: 'Stream end time (defaults to now)' })
  @IsDateString()
  @IsOptional()
  ended_at: string;
}
