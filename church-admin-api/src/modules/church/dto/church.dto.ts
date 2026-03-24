import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsHexColor,
  IsEnum,
  IsBoolean,
  IsISO8601,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PlanType, ChurchSettings } from '../entities/church.entity';

export class CreateChurchDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase with hyphens only',
  })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  website_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @Matches(/^\d{5}(-\d{4})?$/, {
    message: 'zip_code must be valid US zip code',
  })
  zip_code?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @IsOptional()
  @IsHexColor()
  secondary_color?: string;

  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @IsOptional()
  @IsISO8601()
  plan_expires_at?: string;
}

export class UpdateChurchDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsUrl()
  website_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @Matches(/^\d{5}(-\d{4})?$/, {
    message: 'zip_code must be valid US zip code',
  })
  zip_code?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @IsOptional()
  @IsHexColor()
  secondary_color?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class OnboardingDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  giving_provider?: string;
}

export class UpdatePlanDto {
  @IsEnum(PlanType)
  plan: PlanType;

  @IsOptional()
  @IsISO8601()
  plan_expires_at?: string;
}

export class ChurchSettingsDto {
  @IsOptional()
  max_sermons?: number;

  @IsOptional()
  max_events?: number;

  @IsOptional()
  max_storage_mb?: number;

  @IsOptional()
  features_enabled?: string[];
}

export class ChurchResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  timezone: string;
  primary_color: string;
  secondary_color: string;
  plan: PlanType;
  plan_expires_at: Date;
  is_active: boolean;
  settings: ChurchSettings;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ChurchUsageDto {
  church_id: string;
  sermons_count: number;
  max_sermons: number;
  sermons_usage_percent: number;

  events_count: number;
  max_events: number;
  events_usage_percent: number;

  storage_used_mb: number;
  max_storage_mb: number;
  storage_usage_percent: number;

  plan: PlanType;
  plan_expires_at: Date;
  is_active: boolean;
}

export class PaginatedChurchesDto {
  data: ChurchResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class ChurchQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;
}
