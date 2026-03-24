import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ScheduledPublishProcessor } from './scheduled-publish.processor';
import { MediaCleanupProcessor } from './media-cleanup.processor';
import { JobsService } from './jobs.service';

/**
 * Jobs Module
 * Registers Bull queues for background job processing
 * Sets up repeatable jobs for scheduled publishing and media cleanup
 */
@Module({
  imports: [
    // Register queues with Bull
    BullModule.registerQueue(
      {
        name: 'scheduled-publish',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      {
        name: 'media-cleanup',
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    ),
  ],
  providers: [ScheduledPublishProcessor, MediaCleanupProcessor, JobsService],
  exports: [JobsService],
})
export class JobsModule implements OnModuleInit {
  constructor(
    @InjectQueue('scheduled-publish')
    private scheduledPublishQueue: Queue,
    @InjectQueue('media-cleanup') private mediaCleanupQueue: Queue,
  ) {}

  /**
   * Initialize repeatable jobs when the module loads
   * These jobs run on a schedule specified by the cron expression
   */
  async onModuleInit(): Promise<void> {
    try {
      // Remove existing repeatable jobs to avoid duplicates
      const scheduledPublishJobs = await this.scheduledPublishQueue.getRepeatableJobs();
      for (const job of scheduledPublishJobs) {
        if (job.name === 'scheduled-publish-every-minute') {
          await this.scheduledPublishQueue.removeRepeatableByKey(job.key);
        }
      }

      const mediaCleanupJobs = await this.mediaCleanupQueue.getRepeatableJobs();
      for (const job of mediaCleanupJobs) {
        if (job.name === 'media-cleanup-daily') {
          await this.mediaCleanupQueue.removeRepeatableByKey(job.key);
        }
      }

      // Set up repeatable job: scheduled-publish runs every minute
      // Cron: "0 * * * * *" (every minute)
      await this.scheduledPublishQueue.add(
        'scheduled-publish-every-minute',
        {},
        {
          repeat: {
            cron: '*/1 * * * *', // Every 1 minute
            // Alternative: every 60 seconds
            // every: 60000, // 60 seconds in milliseconds
          },
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );

      console.log(
        '[JobsModule] Scheduled publish job configured to run every minute',
      );

      // Set up repeatable job: media-cleanup runs daily at 2 AM
      // Cron: "0 2 * * *" (2:00 AM every day)
      await this.mediaCleanupQueue.add(
        'media-cleanup-daily',
        {},
        {
          repeat: {
            cron: '0 2 * * *', // Every day at 2:00 AM UTC
          },
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: false,
          removeOnFail: false,
        },
      );

      console.log(
        '[JobsModule] Media cleanup job configured to run daily at 2:00 AM UTC',
      );
    } catch (error) {
      console.error('[JobsModule] Error setting up repeatable jobs:', error);
      throw error;
    }
  }
}
