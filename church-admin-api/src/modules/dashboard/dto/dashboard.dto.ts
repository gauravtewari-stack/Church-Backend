export class DashboardStatsDto {
  label: string;
  value: number | string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
}

export class ContentStatsDto {
  module: string;
  total: number;
  published: number;
  draft: number;
  archived: number;
}

export class DashboardOverviewDto {
  total_sermons: {
    count: number;
    published: number;
    draft: number;
  };
  total_events: {
    count: number;
    upcoming: number;
    past: number;
  };
  total_donations: {
    amount: string;
    count: number;
    average: string;
  };
  total_media: {
    count: number;
    storage_used_bytes: bigint;
    storage_used_readable: string;
  };
  recent_activity: ActivityLogDto[];
}

export class ActivityLogDto {
  id: string;
  action: string;
  entity_type: string;
  entity_name: string;
  user_name: string;
  created_at: Date;
}

export class ContentBreakdownDto {
  sermons: ContentStatsDto;
  events: ContentStatsDto;
  hymns: ContentStatsDto;
  announcements: ContentStatsDto;
}

export class DonationStatsDto {
  total_raised: string;
  total_count: number;
  this_month: {
    amount: string;
    count: number;
    average: string;
  };
  last_month: {
    amount: string;
    count: number;
    average: string;
  };
  by_campaign: {
    campaign_name: string;
    amount: string;
    count: number;
  }[];
}

export class UpcomingEventDto {
  id: string;
  title: string;
  event_date: Date;
  location: string;
  attendee_count: number;
}

export class PopularContentDto {
  id: string;
  title: string;
  type: string;
  view_count: number;
  engagement: number;
}

export class StorageStatsDto {
  used_bytes: bigint;
  used_readable: string;
  total_bytes: bigint;
  total_readable: string;
  percentage_used: number;
  by_type: {
    [key: string]: {
      count: number;
      bytes: bigint;
      readable: string;
    };
  };
}

export class PlanStatusDto {
  plan_name: string;
  plan_tier: string;
  billing_cycle: string;
  renewal_date: Date;
  storage_limit_bytes: bigint;
  storage_limit_readable: string;
  storage_used_bytes: bigint;
  storage_used_readable: string;
  storage_percentage: number;
  feature_limits: {
    [key: string]: {
      limit: number;
      used: number;
      percentage: number;
    };
  };
  upgrade_needed: boolean;
  upgrade_reason: string | null;
}

export class OnboardingStatusDto {
  overall_completion: number;
  modules_with_content: string[];
  first_sermon_added: boolean;
  first_event_added: boolean;
  media_uploaded: boolean;
  team_members_added: boolean;
  completion_steps: {
    step: string;
    completed: boolean;
    completion_date: Date | null;
  }[];
}

export class DashboardResponseDto {
  overview?: DashboardOverviewDto;
  content_stats?: ContentBreakdownDto;
  recent_content?: any[];
  donation_stats?: DonationStatsDto;
  upcoming_events?: UpcomingEventDto[];
  popular_content?: PopularContentDto[];
  storage?: StorageStatsDto;
  plan_status?: PlanStatusDto;
  onboarding?: OnboardingStatusDto;
}
