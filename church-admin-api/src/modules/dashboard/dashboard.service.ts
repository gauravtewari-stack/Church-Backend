import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Media, MediaType } from '../media/entities/media.entity';
import {
  DashboardOverviewDto,
  ActivityLogDto,
  ContentBreakdownDto,
  ContentStatsDto,
  DonationStatsDto,
  UpcomingEventDto,
  PopularContentDto,
  StorageStatsDto,
  PlanStatusDto,
  OnboardingStatusDto,
} from './dto/dashboard.dto';
import { AuditLog, AuditAction } from '../../common/entities/audit-log.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getOverview(churchId: string): Promise<DashboardOverviewDto> {
    const [sermonStats, eventStats, donationStats, mediaStats, recentActivity] =
      await Promise.all([
        this.getSermonStats(churchId),
        this.getEventStats(churchId),
        this.getDonationAmount(churchId),
        this.getMediaStats(churchId),
        this.getRecentActivity(churchId, 10),
      ]);

    return {
      total_sermons: sermonStats,
      total_events: eventStats,
      total_donations: donationStats,
      total_media: mediaStats,
      recent_activity: recentActivity,
    };
  }

  async getContentStats(churchId: string): Promise<ContentBreakdownDto> {
    return {
      sermons: await this.getEntityStats(churchId, 'sermon'),
      events: await this.getEntityStats(churchId, 'event'),
      hymns: await this.getEntityStats(churchId, 'hymn'),
      announcements: await this.getEntityStats(churchId, 'announcement'),
    };
  }

  async getRecentContent(
    churchId: string,
    limit: number = 10,
  ): Promise<
    Array<{
      id: string;
      title: string;
      type: string;
      status: string;
      created_at: Date;
    }>
  > {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const sermons = await queryRunner.query(
        `
        SELECT id, title, 'sermon' as type, status, created_at
        FROM sermons
        WHERE church_id = $1 AND deleted_at IS NULL
        UNION ALL
        SELECT id, title, 'event' as type, status, created_at
        FROM events
        WHERE church_id = $1 AND deleted_at IS NULL
        UNION ALL
        SELECT id, title, 'hymn' as type, 'published' as status, created_at
        FROM hymns
        WHERE church_id = $1 AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT $2
        `,
        [churchId, limit],
      );

      return sermons;
    } finally {
      await queryRunner.release();
    }
  }

  async getDonationStats(churchId: string): Promise<DonationStatsDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Total stats
      const totalResult = await queryRunner.query(
        `
        SELECT
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_amount,
          COUNT(*) as total_count
        FROM donations
        WHERE church_id = $1 AND deleted_at IS NULL
        `,
        [churchId],
      );

      const totalAmount = totalResult[0]?.total_amount || '0';
      const totalCount = parseInt(totalResult[0]?.total_count) || 0;

      // This month
      const thisMonthResult = await queryRunner.query(
        `
        SELECT
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as amount,
          COUNT(*) as count
        FROM donations
        WHERE church_id = $1
          AND deleted_at IS NULL
          AND DATE_TRUNC('month', donation_date) = DATE_TRUNC('month', CURRENT_DATE)
        `,
        [churchId],
      );

      const thisMonthAmount = thisMonthResult[0]?.amount || '0';
      const thisMonthCount = parseInt(thisMonthResult[0]?.count) || 0;

      // Last month
      const lastMonthResult = await queryRunner.query(
        `
        SELECT
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as amount,
          COUNT(*) as count
        FROM donations
        WHERE church_id = $1
          AND deleted_at IS NULL
          AND DATE_TRUNC('month', donation_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        `,
        [churchId],
      );

      const lastMonthAmount = lastMonthResult[0]?.amount || '0';
      const lastMonthCount = parseInt(lastMonthResult[0]?.count) || 0;

      // By campaign
      const campaignResult = await queryRunner.query(
        `
        SELECT
          campaign_name,
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as amount,
          COUNT(*) as count
        FROM donations
        WHERE church_id = $1 AND deleted_at IS NULL AND campaign_name IS NOT NULL
        GROUP BY campaign_name
        ORDER BY amount DESC
        LIMIT 5
        `,
        [churchId],
      );

      const thisMonthAverage =
        thisMonthCount > 0
          ? (parseFloat(thisMonthAmount) / thisMonthCount).toFixed(2)
          : '0.00';
      const lastMonthAverage =
        lastMonthCount > 0
          ? (parseFloat(lastMonthAmount) / lastMonthCount).toFixed(2)
          : '0.00';
      const totalAverage =
        totalCount > 0 ? (parseFloat(totalAmount) / totalCount).toFixed(2) : '0.00';

      return {
        total_raised: parseFloat(totalAmount).toFixed(2),
        total_count: totalCount,
        this_month: {
          amount: parseFloat(thisMonthAmount).toFixed(2),
          count: thisMonthCount,
          average: thisMonthAverage,
        },
        last_month: {
          amount: parseFloat(lastMonthAmount).toFixed(2),
          count: lastMonthCount,
          average: lastMonthAverage,
        },
        by_campaign: campaignResult.map((row) => ({
          campaign_name: row.campaign_name,
          amount: parseFloat(row.amount).toFixed(2),
          count: parseInt(row.count),
        })),
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getUpcomingEvents(churchId: string, limit: number = 5): Promise<UpcomingEventDto[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const events = await queryRunner.query(
        `
        SELECT
          id,
          title,
          event_date,
          location,
          COALESCE(attendee_count, 0) as attendee_count
        FROM events
        WHERE church_id = $1
          AND deleted_at IS NULL
          AND status = 'published'
          AND event_date >= CURRENT_TIMESTAMP
        ORDER BY event_date ASC
        LIMIT $2
        `,
        [churchId, limit],
      );

      return events;
    } finally {
      await queryRunner.release();
    }
  }

  async getPopularContent(churchId: string): Promise<PopularContentDto[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const content = await queryRunner.query(
        `
        SELECT
          id,
          title,
          'sermon' as type,
          COALESCE(view_count, 0) as view_count,
          COALESCE(like_count, 0) as engagement
        FROM sermons
        WHERE church_id = $1 AND deleted_at IS NULL AND status = 'published'
        ORDER BY view_count DESC
        LIMIT 10
        `,
        [churchId],
      );

      return content;
    } finally {
      await queryRunner.release();
    }
  }

  async getStorageUsage(churchId: string): Promise<StorageStatsDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const storageResult = await queryRunner.query(
        `
        SELECT
          COALESCE(SUM(file_size), 0) as total_bytes,
          media_type,
          COUNT(*) as type_count,
          COALESCE(SUM(file_size), 0) as type_bytes
        FROM media
        WHERE church_id = $1 AND deleted_at IS NULL
        GROUP BY media_type
        `,
        [churchId],
      );

      let totalBytes = BigInt(0);
      const byType: any = {};

      for (const row of storageResult) {
        const typeBytes = BigInt(row.type_bytes);
        byType[row.media_type] = {
          count: parseInt(row.type_count),
          bytes: typeBytes,
          readable: this.formatBytes(typeBytes),
        };
        totalBytes += typeBytes;
      }

      // Plan limit - would need to fetch from church subscription
      const planLimitBytes = BigInt(100 * 1024 * 1024 * 1024); // 100GB default

      return {
        used_bytes: totalBytes,
        used_readable: this.formatBytes(totalBytes),
        total_bytes: planLimitBytes,
        total_readable: this.formatBytes(planLimitBytes),
        percentage_used: Number((totalBytes * BigInt(100)) / planLimitBytes),
        by_type: byType,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getPlanStatus(churchId: string): Promise<PlanStatusDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Fetch church subscription info
      const churchResult = await queryRunner.query(
        `
        SELECT
          plan_tier,
          storage_limit_bytes
        FROM churches
        WHERE id = $1
        `,
        [churchId],
      );

      const church = churchResult[0] || {};
      const planTier = church.plan_tier || 'starter';
      const storageLimitBytes = BigInt(church.storage_limit_bytes) || BigInt(100 * 1024 * 1024 * 1024);

      // Get actual usage
      const storage = await this.getStorageUsage(churchId);

      // Feature limits (example structure)
      const featureLimits: any = {
        users: {
          limit: planTier === 'starter' ? 5 : planTier === 'professional' ? 25 : 999,
          used: 0,
        },
        media_categories: {
          limit: planTier === 'starter' ? 5 : 999,
          used: 0,
        },
      };

      // Count actual users
      const userResult = await queryRunner.query(
        `
        SELECT COUNT(*) as count
        FROM users
        WHERE church_id = $1 AND deleted_at IS NULL
        `,
        [churchId],
      );

      featureLimits.users.used = parseInt(userResult[0]?.count) || 0;
      featureLimits.users.percentage = Math.floor(
        (featureLimits.users.used * 100) / featureLimits.users.limit,
      );

      const storagePercentage = Number(
        (storage.used_bytes * BigInt(100)) / storageLimitBytes,
      );
      const upgradeNeeded = storagePercentage >= 80;

      return {
        plan_name: this.getPlanName(planTier),
        plan_tier: planTier,
        billing_cycle: 'monthly',
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        storage_limit_bytes: storageLimitBytes,
        storage_limit_readable: this.formatBytes(storageLimitBytes),
        storage_used_bytes: storage.used_bytes,
        storage_used_readable: storage.used_readable,
        storage_percentage: storagePercentage,
        feature_limits: featureLimits,
        upgrade_needed: upgradeNeeded,
        upgrade_reason: upgradeNeeded ? 'Storage usage above 80%' : null,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getOnboardingStatus(churchId: string): Promise<OnboardingStatusDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const [hasSermons, hasEvents, hasMedia, hasUsers] = await Promise.all([
        this.checkEntityExists(queryRunner, churchId, 'sermons'),
        this.checkEntityExists(queryRunner, churchId, 'events'),
        this.checkEntityExists(queryRunner, churchId, 'media'),
        this.checkEntityExists(queryRunner, churchId, 'users'),
      ]);

      const completionSteps = [
        { step: 'Add first sermon', completed: hasSermons, completion_date: null },
        { step: 'Create an event', completed: hasEvents, completion_date: null },
        { step: 'Upload media', completed: hasMedia, completion_date: null },
        { step: 'Invite team members', completed: hasUsers, completion_date: null },
      ];

      const completedCount = completionSteps.filter((s) => s.completed).length;
      const overallCompletion = Math.round((completedCount / completionSteps.length) * 100);

      return {
        overall_completion: overallCompletion,
        modules_with_content: [
          hasSermons && 'sermons',
          hasEvents && 'events',
          hasMedia && 'media',
        ].filter(Boolean) as string[],
        first_sermon_added: hasSermons,
        first_event_added: hasEvents,
        media_uploaded: hasMedia,
        team_members_added: hasUsers,
        completion_steps: completionSteps,
      };
    } finally {
      await queryRunner.release();
    }
  }

  private async getSermonStats(
    churchId: string,
  ): Promise<{ count: number; published: number; draft: number }> {
    const result = await this.dataSource.query(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
      FROM sermons
      WHERE church_id = $1 AND deleted_at IS NULL
      `,
      [churchId],
    );

    return {
      count: parseInt(result[0]?.total) || 0,
      published: parseInt(result[0]?.published) || 0,
      draft: parseInt(result[0]?.draft) || 0,
    };
  }

  private async getEventStats(
    churchId: string,
  ): Promise<{ count: number; upcoming: number; past: number }> {
    const result = await this.dataSource.query(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN event_date >= CURRENT_TIMESTAMP THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN event_date < CURRENT_TIMESTAMP THEN 1 ELSE 0 END) as past
      FROM events
      WHERE church_id = $1 AND deleted_at IS NULL AND status = 'published'
      `,
      [churchId],
    );

    return {
      count: parseInt(result[0]?.total) || 0,
      upcoming: parseInt(result[0]?.upcoming) || 0,
      past: parseInt(result[0]?.past) || 0,
    };
  }

  private async getDonationAmount(
    churchId: string,
  ): Promise<{ amount: string; count: number; average: string }> {
    const result = await this.dataSource.query(
      `
      SELECT
        COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as total_amount,
        COUNT(*) as total_count
      FROM donations
      WHERE church_id = $1 AND deleted_at IS NULL
      `,
      [churchId],
    );

    const amount = result[0]?.total_amount || '0';
    const count = parseInt(result[0]?.total_count) || 0;
    const average = count > 0 ? (parseFloat(amount) / count).toFixed(2) : '0.00';

    return {
      amount: parseFloat(amount).toFixed(2),
      count,
      average,
    };
  }

  private async getMediaStats(
    churchId: string,
  ): Promise<{ count: number; storage_used_bytes: bigint; storage_used_readable: string }> {
    const result = await this.dataSource.query(
      `
      SELECT
        COUNT(*) as count,
        COALESCE(SUM(file_size), 0) as total_bytes
      FROM media
      WHERE church_id = $1 AND deleted_at IS NULL
      `,
      [churchId],
    );

    const totalBytes = BigInt(result[0]?.total_bytes) || BigInt(0);

    return {
      count: parseInt(result[0]?.count) || 0,
      storage_used_bytes: totalBytes,
      storage_used_readable: this.formatBytes(totalBytes),
    };
  }

  private async getRecentActivity(churchId: string, limit: number): Promise<ActivityLogDto[]> {
    const logs = await this.auditLogRepository.find({
      where: { church_id: churchId },
      order: { created_at: 'DESC' },
      take: limit,
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity_type: log.entity_type,
      entity_name: log.entity_id,
      user_name: log.user_id,
      created_at: log.created_at,
    }));
  }

  private async getEntityStats(
    churchId: string,
    entityType: string,
  ): Promise<ContentStatsDto> {
    const tableMap: Record<string, string> = {
      sermon: 'sermons',
      event: 'events',
      hymn: 'hymns',
      announcement: 'announcements',
    };

    const table = tableMap[entityType];
    if (!table) {
      return { module: entityType, total: 0, published: 0, draft: 0, archived: 0 };
    }

    const result = await this.dataSource.query(
      `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived
      FROM ${table}
      WHERE church_id = $1 AND deleted_at IS NULL
      `,
      [churchId],
    );

    return {
      module: entityType,
      total: parseInt(result[0]?.total) || 0,
      published: parseInt(result[0]?.published) || 0,
      draft: parseInt(result[0]?.draft) || 0,
      archived: parseInt(result[0]?.archived) || 0,
    };
  }

  private async checkEntityExists(
    queryRunner: any,
    churchId: string,
    table: string,
  ): Promise<boolean> {
    const result = await queryRunner.query(
      `
      SELECT COUNT(*) as count
      FROM ${table}
      WHERE church_id = $1 AND deleted_at IS NULL
      LIMIT 1
      `,
      [churchId],
    );

    return parseInt(result[0]?.count) > 0;
  }

  private formatBytes(bytes: bigint): string {
    const numBytes = Number(bytes);
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = numBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  private getPlanName(tier: string): string {
    const planNames: Record<string, string> = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise',
    };

    return planNames[tier] || tier;
  }
}
