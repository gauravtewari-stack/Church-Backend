import { Processor, Process } from '@nestjs/bull';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ContentStatus } from '../common/enums';

/**
 * Scheduled Publish Processor
 * Publishes scheduled content when the scheduled_at time is reached.
 * Runs every minute via a repeatable job.
 * Handles all content tables: sermons, events, spiritual_resources, hymns, donation_campaigns, live_streams
 */
@Injectable()
@Processor('scheduled-publish')
export class ScheduledPublishProcessor {
  private readonly logger = new Logger(ScheduledPublishProcessor.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Main process handler for scheduled content publishing
   * Runs on a schedule (every minute) to check for content that should be published
   */
  @Process()
  async handleScheduledPublish(job: Job): Promise<void> {
    try {
      const now = new Date();
      this.logger.log(
        `Starting scheduled publish check at ${now.toISOString()}`,
      );

      // Use QueryRunner for transaction support if needed
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        // Execute publishing for all content tables
        const results = await Promise.all([
          this.publishSermons(queryRunner, now),
          this.publishEvents(queryRunner, now),
          this.publishSpiritualResources(queryRunner, now),
          this.publishHymns(queryRunner, now),
          this.publishDonationCampaigns(queryRunner, now),
          this.publishLiveStreams(queryRunner, now),
        ]);

        const totalPublished = results.reduce((sum, count) => sum + count, 0);

        this.logger.log(
          `Scheduled publish check completed. Total items published: ${totalPublished}`,
        );

        // Update job progress
        job.progress(100);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error in scheduled publish job: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Publish scheduled sermons
   */
  private async publishSermons(queryRunner: any, now: Date): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update('sermons')
        .set({
          status: ContentStatus.PUBLISHED,
          published_at: now,
          updated_at: now,
        })
        .where('status = :status', { status: ContentStatus.SCHEDULED })
        .andWhere('scheduled_at IS NOT NULL')
        .andWhere('scheduled_at <= :now', { now })
        .execute();

      const count = result.affected || 0;
      if (count > 0) {
        this.logger.log(`Published ${count} sermon(s)`);
      }
      return count;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error publishing sermons: ${message}`,
        stack,
      );
      return 0;
    }
  }

  /**
   * Publish scheduled events
   */
  private async publishEvents(queryRunner: any, now: Date): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update('events')
        .set({
          status: ContentStatus.PUBLISHED,
          published_at: now,
          updated_at: now,
        })
        .where('status = :status', { status: ContentStatus.SCHEDULED })
        .andWhere('scheduled_at IS NOT NULL')
        .andWhere('scheduled_at <= :now', { now })
        .execute();

      const count = result.affected || 0;
      if (count > 0) {
        this.logger.log(`Published ${count} event(s)`);
      }
      return count;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error publishing events: ${message}`,
        stack,
      );
      return 0;
    }
  }

  /**
   * Publish scheduled spiritual resources
   */
  private async publishSpiritualResources(
    queryRunner: any,
    now: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update('spiritual_resources')
        .set({
          status: ContentStatus.PUBLISHED,
          published_at: now,
          updated_at: now,
        })
        .where('status = :status', { status: ContentStatus.SCHEDULED })
        .andWhere('scheduled_at IS NOT NULL')
        .andWhere('scheduled_at <= :now', { now })
        .execute();

      const count = result.affected || 0;
      if (count > 0) {
        this.logger.log(`Published ${count} spiritual resource(s)`);
      }
      return count;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error publishing spiritual resources: ${message}`,
        stack,
      );
      return 0;
    }
  }

  /**
   * Publish scheduled hymns
   */
  private async publishHymns(queryRunner: any, now: Date): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update('hymns')
        .set({
          status: ContentStatus.PUBLISHED,
          published_at: now,
          updated_at: now,
        })
        .where('status = :status', { status: ContentStatus.SCHEDULED })
        .andWhere('scheduled_at IS NOT NULL')
        .andWhere('scheduled_at <= :now', { now })
        .execute();

      const count = result.affected || 0;
      if (count > 0) {
        this.logger.log(`Published ${count} hymn(s)`);
      }
      return count;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error publishing hymns: ${message}`,
        stack,
      );
      return 0;
    }
  }

  /**
   * Publish scheduled donation campaigns
   */
  private async publishDonationCampaigns(
    queryRunner: any,
    now: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update('donation_campaigns')
        .set({
          status: ContentStatus.PUBLISHED,
          published_at: now,
          updated_at: now,
        })
        .where('status = :status', { status: ContentStatus.SCHEDULED })
        .andWhere('scheduled_at IS NOT NULL')
        .andWhere('scheduled_at <= :now', { now })
        .execute();

      const count = result.affected || 0;
      if (count > 0) {
        this.logger.log(`Published ${count} donation campaign(s)`);
      }
      return count;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error publishing donation campaigns: ${message}`,
        stack,
      );
      return 0;
    }
  }

  /**
   * Publish scheduled live streams
   */
  private async publishLiveStreams(
    queryRunner: any,
    now: Date,
  ): Promise<number> {
    try {
      const result = await queryRunner.manager
        .createQueryBuilder()
        .update('live_streams')
        .set({
          status: ContentStatus.PUBLISHED,
          published_at: now,
          updated_at: now,
        })
        .where('status = :status', { status: ContentStatus.SCHEDULED })
        .andWhere('scheduled_at IS NOT NULL')
        .andWhere('scheduled_at <= :now', { now })
        .execute();

      const count = result.affected || 0;
      if (count > 0) {
        this.logger.log(`Published ${count} live stream(s)`);
      }
      return count;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error publishing live streams: ${message}`,
        stack,
      );
      return 0;
    }
  }
}
