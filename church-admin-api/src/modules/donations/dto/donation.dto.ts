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
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ContentStatus, SortOrder, PaymentStatus, PaymentMethod } from '../../../common/enums';

// Campaign DTOs
export class CreateCampaignDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goal_amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency: string = 'USD';

  @IsOptional()
  @IsString()
  @IsUrl()
  image_url: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  campaign_type: string; // 'general' | 'building' | 'missions' | 'education' | 'charity' | 'emergency'

  @IsOptional()
  @IsEnum(ContentStatus)
  status: ContentStatus = ContentStatus.DRAFT;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsUUID('4')
  linked_event_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_provider: string; // 'stripe' | 'paypal' | 'none'

  @IsOptional()
  @IsObject()
  payment_provider_config: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  is_recurring_enabled: boolean = false;
}

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goal_amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  image_url: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  campaign_type: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @IsOptional()
  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsUUID('4')
  linked_event_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_provider: string;

  @IsOptional()
  @IsObject()
  payment_provider_config: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  is_recurring_enabled: boolean;
}

export class CampaignQueryDto {
  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status: ContentStatus;

  @IsOptional()
  @IsDateString()
  date_from: string;

  @IsOptional()
  @IsDateString()
  date_to: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_active: boolean;

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

// Transaction DTOs
export class RecordTransactionDto {
  @IsUUID('4')
  campaign_id: string;

  @IsString()
  @MinLength(1)
  donor_name: string;

  @IsEmail()
  donor_email: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency: string = 'USD';

  @IsString()
  payment_method: string;

  @IsString()
  payment_provider: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  transaction_id: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus = PaymentStatus.PENDING;

  @IsOptional()
  @IsBoolean()
  is_anonymous: boolean = false;

  @IsOptional()
  @IsBoolean()
  is_recurring: boolean = false;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;
}

export class CreateTransactionDto {
  @IsUUID('4')
  campaign_id: string;

  @IsString()
  @MinLength(1)
  donor_name: string;

  @IsEmail()
  donor_email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  donor_phone: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency: string = 'USD';

  @IsString()
  payment_method: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  transaction_id: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus = PaymentStatus.COMPLETED;

  @IsOptional()
  @IsBoolean()
  is_anonymous: boolean = false;

  @IsOptional()
  @IsBoolean()
  is_recurring: boolean = false;

  @IsOptional()
  @IsDateString()
  donated_at: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsObject()
  metadata: Record<string, any>;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  donor_name: string;

  @IsOptional()
  @IsEmail()
  donor_email: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  donor_phone: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsUUID('4')
  campaign_id: string;

  @IsOptional()
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsDateString()
  donated_at: string;

  @IsOptional()
  @IsString()
  notes: string;
}

export class TransactionQueryDto {
  @IsOptional()
  @IsUUID('4')
  campaign_id: string;

  @IsOptional()
  @IsString()
  donor_name: string;

  @IsOptional()
  @IsEmail()
  donor_email: string;

  @IsOptional()
  @IsString()
  payment_method: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsDateString()
  date_from: string;

  @IsOptional()
  @IsDateString()
  date_to: string;

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

// Stats DTO
export class DonationStatsDto {
  total_campaigns: number;
  active_campaigns: number;
  total_raised: number;
  by_campaign: Array<{
    campaign_id: string;
    campaign_title: string;
    amount: number;
    transaction_count: number;
    percentage: number;
  }>;
  by_month: Array<{
    month: string;
    amount: number;
    transaction_count: number;
  }>;
  by_status: Record<string, { count: number; amount: number }>;
  total_transactions: number;
  recurring_transactions: number;
  average_donation: number;
  largest_donation: number;
  currency: string;
}

export class CampaignProgressDto {
  campaign_id: string;
  title: string;
  goal_amount: number;
  current_amount: number;
  currency: string;
  percentage: number;
  transaction_count: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  days_remaining: number;
}

export class DonationWebhookDto {
  @IsString()
  event: string;

  @IsObject()
  data: Record<string, any>;

  @IsString()
  @IsOptional()
  signature: string;
}

export class CampaignResponseDto {
  id: string;
  church_id: string;
  title: string;
  slug: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  currency: string;
  image_url: string;
  campaign_type: string;
  status: ContentStatus;
  start_date: Date;
  end_date: Date;
  linked_event_id: string;
  payment_provider: string;
  payment_provider_config: Record<string, any>;
  is_recurring_enabled: boolean;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  created_by: string;
  updated_by: string;
}

export class TransactionResponseDto {
  id: string;
  church_id: string;
  campaign_id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_provider: string;
  transaction_id: string;
  status: string;
  is_anonymous: boolean;
  is_recurring: boolean;
  donated_at: Date;
  notes: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
