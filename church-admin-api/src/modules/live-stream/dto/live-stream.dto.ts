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

export class CreateLiveStreamDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsUrl()
  @IsNotEmpty()
  stream_url: string;

  @IsString()
  @IsOptional()
  embed_code: string;

  @IsEnum(['youtube', 'facebook', 'vimeo', 'custom'])
  @IsOptional()
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom' = 'custom';

  @IsUrl()
  @IsOptional()
  thumbnail_url: string;

  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @IsUUID()
  @IsOptional()
  linked_event_id: string;

  @IsBoolean()
  @IsOptional()
  is_featured: boolean = false;
}

export class UpdateLiveStreamDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description: string;

  @IsUrl()
  @IsOptional()
  stream_url: string;

  @IsString()
  @IsOptional()
  embed_code: string;

  @IsEnum(['youtube', 'facebook', 'vimeo', 'custom'])
  @IsOptional()
  platform: 'youtube' | 'facebook' | 'vimeo' | 'custom';

  @IsUrl()
  @IsOptional()
  thumbnail_url: string;

  @IsDateString()
  @IsOptional()
  scheduled_at: string;

  @IsEnum(['scheduled', 'live', 'ended', 'archived'])
  @IsOptional()
  status: 'scheduled' | 'live' | 'ended' | 'archived';

  @IsUUID()
  @IsOptional()
  linked_event_id: string;

  @IsBoolean()
  @IsOptional()
  is_featured: boolean;
}

export class LiveStreamQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(['scheduled', 'live', 'ended', 'archived'])
  status: 'scheduled' | 'live' | 'ended' | 'archived';

  @IsOptional()
  @IsBoolean()
  is_featured: boolean;

  @IsOptional()
  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  sort: string = '-scheduled_at';

  @IsOptional()
  page: number = 1;

  @IsOptional()
  limit: number = 10;
}

export class GoLiveDto {
  @IsDateString()
  @IsOptional()
  started_at: string;
}

export class EndStreamDto {
  @IsDateString()
  @IsOptional()
  ended_at: string;
}
