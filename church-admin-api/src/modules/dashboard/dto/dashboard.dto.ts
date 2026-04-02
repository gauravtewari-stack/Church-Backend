import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Stat label', example: 'Total Sermons' }) label: string;
  @ApiProperty({ description: 'Stat value', example: 42 }) value: number | string;
  @ApiPropertyOptional({ description: 'Change percentage', example: 12.5 }) change?: number;
  @ApiPropertyOptional({ description: 'Change direction', enum: ['up', 'down', 'neutral'] }) changeDirection?: 'up' | 'down' | 'neutral';
}

export class ContentStatsDto {
  @ApiProperty({ example: 'sermons' }) module: string;
  @ApiProperty({ example: 42 }) total: number;
  @ApiProperty({ example: 30 }) published: number;
  @ApiProperty({ example: 8 }) draft: number;
  @ApiProperty({ example: 4 }) archived: number;
}

export class ActivityLogDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'created' }) action: string;
  @ApiProperty({ example: 'sermon' }) entity_type: string;
  @ApiProperty({ example: 'Sunday Worship' }) entity_name: string;
  @ApiProperty({ example: 'John Doe' }) user_name: string;
  @ApiProperty() created_at: Date;
}

export class DashboardOverviewDto {
  @ApiProperty() total_sermons: {
    count: number;
    published: number;
    draft: number;
  };
  @ApiProperty() total_events: {
    count: number;
    upcoming: number;
    past: number;
  };
  @ApiProperty() total_donations: {
    amount: string;
    count: number;
    average: string;
  };
  @ApiProperty() total_media: {
    count: number;
    storage_used_bytes: bigint;
    storage_used_readable: string;
  };
  @ApiProperty({ type: [ActivityLogDto] }) recent_activity: ActivityLogDto[];
}

export class ContentBreakdownDto {
  @ApiProperty({ type: ContentStatsDto }) sermons: ContentStatsDto;
  @ApiProperty({ type: ContentStatsDto }) events: ContentStatsDto;
  @ApiProperty({ type: ContentStatsDto }) hymns: ContentStatsDto;
  @ApiProperty({ type: ContentStatsDto }) announcements: ContentStatsDto;
}

export class DonationStatsDto {
  @ApiProperty({ example: '$15,250.00' }) total_raised: string;
  @ApiProperty({ example: 156 }) total_count: number;
  @ApiProperty() this_month: {
    amount: string;
    count: number;
    average: string;
  };
  @ApiProperty() last_month: {
    amount: string;
    count: number;
    average: string;
  };
  @ApiProperty() by_campaign: {
    campaign_name: string;
    amount: string;
    count: number;
  }[];
}

export class UpcomingEventDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Sunday Service' }) title: string;
  @ApiProperty() event_date: Date;
  @ApiProperty({ example: 'Main Hall' }) location: string;
  @ApiProperty({ example: 150 }) attendee_count: number;
}

export class PopularContentDto {
  @ApiProperty() id: string;
  @ApiProperty({ example: 'Amazing Grace' }) title: string;
  @ApiProperty({ example: 'sermon' }) type: string;
  @ApiProperty({ example: 1250 }) view_count: number;
  @ApiProperty({ example: 85 }) engagement: number;
}

export class StorageStatsDto {
  @ApiProperty() used_bytes: bigint;
  @ApiProperty({ example: '2.5 GB' }) used_readable: string;
  @ApiProperty() total_bytes: bigint;
  @ApiProperty({ example: '10 GB' }) total_readable: string;
  @ApiProperty({ example: 25 }) percentage_used: number;
  @ApiProperty() by_type: {
    [key: string]: {
      count: number;
      bytes: bigint;
      readable: string;
    };
  };
}

export class PlanStatusDto {
  @ApiProperty({ example: 'Pro' }) plan_name: string;
  @ApiProperty({ example: 'pro' }) plan_tier: string;
  @ApiProperty({ example: 'monthly' }) billing_cycle: string;
  @ApiProperty() renewal_date: Date;
  @ApiProperty() storage_limit_bytes: bigint;
  @ApiProperty({ example: '10 GB' }) storage_limit_readable: string;
  @ApiProperty() storage_used_bytes: bigint;
  @ApiProperty({ example: '2.5 GB' }) storage_used_readable: string;
  @ApiProperty({ example: 25 }) storage_percentage: number;
  @ApiProperty() feature_limits: {
    [key: string]: {
      limit: number;
      used: number;
      percentage: number;
    };
  };
  @ApiProperty({ example: false }) upgrade_needed: boolean;
  @ApiPropertyOptional() upgrade_reason: string | null;
}

export class OnboardingStatusDto {
  @ApiProperty({ example: 75 }) overall_completion: number;
  @ApiProperty({ example: ['sermons', 'events'] }) modules_with_content: string[];
  @ApiProperty({ example: true }) first_sermon_added: boolean;
  @ApiProperty({ example: true }) first_event_added: boolean;
  @ApiProperty({ example: false }) media_uploaded: boolean;
  @ApiProperty({ example: false }) team_members_added: boolean;
  @ApiProperty() completion_steps: {
    step: string;
    completed: boolean;
    completion_date: Date | null;
  }[];
}

export class DashboardResponseDto {
  @ApiPropertyOptional({ type: DashboardOverviewDto }) overview?: DashboardOverviewDto;
  @ApiPropertyOptional({ type: ContentBreakdownDto }) content_stats?: ContentBreakdownDto;
  @ApiPropertyOptional() recent_content?: any[];
  @ApiPropertyOptional({ type: DonationStatsDto }) donation_stats?: DonationStatsDto;
  @ApiPropertyOptional({ type: [UpcomingEventDto] }) upcoming_events?: UpcomingEventDto[];
  @ApiPropertyOptional({ type: [PopularContentDto] }) popular_content?: PopularContentDto[];
  @ApiPropertyOptional({ type: StorageStatsDto }) storage?: StorageStatsDto;
  @ApiPropertyOptional({ type: PlanStatusDto }) plan_status?: PlanStatusDto;
  @ApiPropertyOptional({ type: OnboardingStatusDto }) onboarding?: OnboardingStatusDto;
}
