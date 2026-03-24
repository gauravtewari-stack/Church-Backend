import {
  IsString,
  IsOptional,
  IsUUID,
  IsDate,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEmail,
  IsUrl,
  Min,
  Max,
  IsEnum,
  MinLength,
  MaxLength,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ContentStatus, SortOrder } from '../../../common/enums';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsDateString()
  event_date: string;

  @IsOptional()
  @IsDateString()
  event_end_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  location_address: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  location_lat: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  location_lng: number;

  @IsOptional()
  @IsBoolean()
  is_virtual: boolean = false;

  @IsOptional()
  @IsString()
  @IsUrl()
  virtual_link: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  featured_image_url: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  flyer_url: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status: ContentStatus = ContentStatus.DRAFT;

  @IsOptional()
  @IsBoolean()
  is_featured: boolean = false;

  @IsOptional()
  @IsBoolean()
  rsvp_enabled: boolean = false;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_attendees: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  registration_url: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seo_title: string;

  @IsOptional()
  @IsString()
  seo_description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  category_ids: string[] = [];
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsDateString()
  event_date: string;

  @IsOptional()
  @IsDateString()
  event_end_date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  location_address: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  location_lat: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  location_lng: number;

  @IsOptional()
  @IsBoolean()
  is_virtual: boolean;

  @IsOptional()
  @IsString()
  @IsUrl()
  virtual_link: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  featured_image_url: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  flyer_url: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @IsOptional()
  @IsBoolean()
  is_featured: boolean;

  @IsOptional()
  @IsBoolean()
  rsvp_enabled: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  max_attendees: number;

  @IsOptional()
  @IsString()
  @IsUrl()
  registration_url: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seo_title: string;

  @IsOptional()
  @IsString()
  seo_description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  category_ids: string[];
}

export class EventQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @IsOptional()
  @IsUUID('4')
  category_id: string;

  @IsOptional()
  @IsDateString()
  date_from: string;

  @IsOptional()
  @IsDateString()
  date_to: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_virtual: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_featured: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  rsvp_enabled: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 20;

  @IsOptional()
  @IsString()
  sort_by: string = 'created_at';

  @IsOptional()
  @IsEnum(SortOrder)
  @Transform(({ value }) => value?.toUpperCase())
  sort_order: SortOrder = SortOrder.DESC;
}

export class BulkEventActionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  event_ids: string[];

  @IsString()
  action: 'publish' | 'archive' | 'delete' | 'restore' | 'feature' | 'unfeature';

  @IsOptional()
  @IsString()
  status: ContentStatus;
}

export class PublishEventDto {
  @IsOptional()
  @IsDateString()
  scheduled_at: string;
}

export class ArchiveEventDto {
  @IsOptional()
  @IsString()
  reason: string;
}

export class DuplicateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsBoolean()
  include_categories: boolean = true;
}

export class EventStatsDto {
  total_events: number;
  draft_count: number;
  published_count: number;
  scheduled_count: number;
  archived_count: number;
  total_rsvp_count: number;
  total_views: number;
  upcoming_events_count: number;
  featured_events_count: number;
}

export class EventResponseDto {
  id: string;
  church_id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  event_date: Date;
  event_end_date: Date;
  location_name: string;
  location_address: string;
  location_lat: number;
  location_lng: number;
  is_virtual: boolean;
  virtual_link: string;
  featured_image_url: string;
  flyer_url: string;
  status: ContentStatus;
  published_at: Date;
  scheduled_at: Date;
  is_featured: boolean;
  rsvp_enabled: boolean;
  rsvp_count: number;
  max_attendees: number;
  registration_url: string;
  seo_title: string;
  seo_description: string;
  view_count: number;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  created_by: string;
  updated_by: string;
  categories?: any[];
}
