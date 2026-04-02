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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType, ChurchSettings } from '../entities/church.entity';

export class CreateChurchDto {
  @ApiProperty({ description: 'Church name', example: 'Grace Community Church' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'grace-community-church' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase with hyphens only',
  })
  slug: string;

  @ApiPropertyOptional({ description: 'Church description', example: 'A welcoming church community' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ description: 'Contact email', example: 'info@gracechurch.org' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+12065551234' })
  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @ApiPropertyOptional({ description: 'Logo URL', example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Website URL', example: 'https://gracechurch.org' })
  @IsOptional()
  @IsUrl()
  website_url?: string;

  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Seattle' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'WA' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'US' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'ZIP code', example: '98101' })
  @IsOptional()
  @Matches(/^\d{5}(-\d{4})?$/, {
    message: 'zip_code must be valid US zip code',
  })
  zip_code?: string;

  @ApiPropertyOptional({ description: 'Timezone', example: 'America/Los_Angeles' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Primary brand color', example: '#3b82f6' })
  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @ApiPropertyOptional({ description: 'Secondary brand color', example: '#1e3a8a' })
  @IsOptional()
  @IsHexColor()
  secondary_color?: string;

  @ApiPropertyOptional({ description: 'Subscription plan', enum: PlanType })
  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @ApiPropertyOptional({ description: 'Plan expiration date', example: '2027-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsISO8601()
  plan_expires_at?: string;
}

export class UpdateChurchDto {
  @ApiPropertyOptional({ description: 'Church name', example: 'Grace Community Church' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Church description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+12065551234' })
  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsUrl()
  website_url?: string;

  @ApiPropertyOptional({ description: 'Street address' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ description: 'ZIP code' })
  @IsOptional()
  @Matches(/^\d{5}(-\d{4})?$/, {
    message: 'zip_code must be valid US zip code',
  })
  zip_code?: string;

  @ApiPropertyOptional({ description: 'Timezone' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Primary brand color' })
  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @ApiPropertyOptional({ description: 'Secondary brand color' })
  @IsOptional()
  @IsHexColor()
  secondary_color?: string;

  @ApiPropertyOptional({ description: 'Whether the church is active' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class OnboardingDto {
  @ApiProperty({ description: 'Church name', example: 'Grace Community Church' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({ description: 'Timezone', example: 'America/Los_Angeles' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Primary brand color', example: '#3b82f6' })
  @IsOptional()
  @IsHexColor()
  primary_color?: string;

  @ApiPropertyOptional({ description: 'Giving provider name', example: 'stripe' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  giving_provider?: string;
}

export class UpdatePlanDto {
  @ApiProperty({ description: 'Subscription plan', enum: PlanType })
  @IsEnum(PlanType)
  plan: PlanType;

  @ApiPropertyOptional({ description: 'Plan expiration date' })
  @IsOptional()
  @IsISO8601()
  plan_expires_at?: string;
}

export class ChurchSettingsDto {
  @ApiPropertyOptional({ description: 'Maximum number of sermons', example: 100 })
  @IsOptional()
  max_sermons?: number;

  @ApiPropertyOptional({ description: 'Maximum number of events', example: 50 })
  @IsOptional()
  max_events?: number;

  @ApiPropertyOptional({ description: 'Maximum storage in MB', example: 5120 })
  @IsOptional()
  max_storage_mb?: number;

  @ApiPropertyOptional({ description: 'List of enabled features', example: ['donations', 'live-stream'] })
  @IsOptional()
  features_enabled?: string[];
}

export class ChurchResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() slug: string;
  @ApiProperty() description: string;
  @ApiProperty() logo_url: string;
  @ApiProperty() website_url: string;
  @ApiProperty() phone: string;
  @ApiProperty() email: string;
  @ApiProperty() address: string;
  @ApiProperty() city: string;
  @ApiProperty() state: string;
  @ApiProperty() country: string;
  @ApiProperty() zip_code: string;
  @ApiProperty() timezone: string;
  @ApiProperty() primary_color: string;
  @ApiProperty() secondary_color: string;
  @ApiProperty({ enum: PlanType }) plan: PlanType;
  @ApiProperty() plan_expires_at: Date;
  @ApiProperty() is_active: boolean;
  @ApiProperty() settings: ChurchSettings;
  @ApiProperty() onboarding_completed: boolean;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class ChurchUsageDto {
  @ApiProperty() church_id: string;
  @ApiProperty() sermons_count: number;
  @ApiProperty() max_sermons: number;
  @ApiProperty() sermons_usage_percent: number;
  @ApiProperty() events_count: number;
  @ApiProperty() max_events: number;
  @ApiProperty() events_usage_percent: number;
  @ApiProperty() storage_used_mb: number;
  @ApiProperty() max_storage_mb: number;
  @ApiProperty() storage_usage_percent: number;
  @ApiProperty({ enum: PlanType }) plan: PlanType;
  @ApiProperty() plan_expires_at: Date;
  @ApiProperty() is_active: boolean;
}

export class PaginatedChurchesDto {
  @ApiProperty({ type: [ChurchResponseDto] }) data: ChurchResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() pages: number;
}

export class ChurchQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by name or slug' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by plan', enum: PlanType })
  @IsOptional()
  @IsEnum(PlanType)
  plan?: PlanType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;
}
