import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

/**
 * Jobs Service
 * Manages manual triggering of background jobs and monitoring job status
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('scheduled-publish')
    private scheduledPublishQueue: Queue,
    @InjectQueue('media-cleanup') private mediaCleanupQueue: Queue,
  ) {}

  /**
   * Manually trigger the scheduled publish job
   * Useful for testing or forcing an immediate publish check
   */
  async triggerScheduledPublish(): Promise<any> {
    try {
      this.logger.log('Manually triggering scheduled publish job');

      const job = await this.scheduledPublishQueue.add(
        {},
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      this.logger.log(`Scheduled publish job created with ID: ${job.id}`);
      return {
        jobId: job.id,
        status: 'created',
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error triggering scheduled publish: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Manually trigger the media cleanup job
   * Useful for testing or forcing an immediate cleanup
   */
  async triggerMediaCleanup(): Promise<any> {
    try {
      this.logger.log('Manually triggering media cleanup job');

      const job = await this.mediaCleanupQueue.add(
        {},
        {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );

      this.logger.log(`Media cleanup job created with ID: ${job.id}`);
      return {
        jobId: job.id,
        status: 'created',
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error triggering media cleanup: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Get the status of a specific job
   */
  async getJobStatus(jobId: string, queueName: string): Promise<any> {
    try {
      const queue =
        queueName === 'scheduled-publish'
          ? this.scheduledPublishQueue
          : this.mediaCleanupQueue;

      const job = await queue.getJob(jobId);

      if (!job) {
        return {
          jobId,
          found: false,
          message: 'Job not found',
        };
      }

      const state = await job.getState();
      const progress = (job as any).progress?.();
      const attempts = job.attemptsMade;
      const failedReason = job.failedReason;
      const createdAt = (job as any).timestamp;

      return {
        jobId,
        found: true,
        state,
        progress,
        attempts,
        failedReason: failedReason || null,
        createdAt,
        processedAt: job.processedOn,
        finishedAt: job.finishedOn,
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error getting job status: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Get statistics about the scheduled-publish queue
   */
  async getScheduledPublishQueueStats(): Promise<any> {
    try {
      const counts = await this.scheduledPublishQueue.getJobCounts();
      const name = this.scheduledPublishQueue.name;

      return {
        queue: name,
        counts,
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error getting queue stats: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Get statistics about the media-cleanup queue
   */
  async getMediaCleanupQueueStats(): Promise<any> {
    try {
      const counts = await this.mediaCleanupQueue.getJobCounts();
      const name = this.mediaCleanupQueue.name;

      return {
        queue: name,
        counts,
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error getting queue stats: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Get all queue stats
   */
  async getAllQueueStats(): Promise<any> {
    try {
      const [publishStats, cleanupStats] = await Promise.all([
        this.getScheduledPublishQueueStats(),
        this.getMediaCleanupQueueStats(),
      ]);

      return {
        queues: [publishStats, cleanupStats],
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error getting all queue stats: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Clear a queue (remove all jobs)
   * Useful for maintenance or debugging
   */
  async clearQueue(queueName: string): Promise<any> {
    try {
      const queue =
        queueName === 'scheduled-publish'
          ? this.scheduledPublishQueue
          : this.mediaCleanupQueue;

      await queue.clean(0, 'failed');
      await queue.clean(0, 'completed');
      await queue.empty();

      this.logger.log(`Cleared queue: ${queueName}`);
      return {
        queue: queueName,
        status: 'cleared',
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error clearing queue: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Get recent jobs from a queue
   */
  async getRecentJobs(
    queueName: string,
    limit: number = 10,
  ): Promise<any[]> {
    try {
      const queue =
        queueName === 'scheduled-publish'
          ? this.scheduledPublishQueue
          : this.mediaCleanupQueue;

      const completed = await queue.getCompleted(0, limit);
      const failed = await queue.getFailed(0, limit);
      const active = await queue.getActive(0, limit);

      return [
        ...active.map((j) => ({
          id: j.id,
          state: 'active',
          progress: j.progress?.(),
        })),
        ...completed.map((j) => ({
          id: j.id,
          state: 'completed',
          finishedOn: j.finishedOn,
        })),
        ...failed.map((j) => ({
          id: j.id,
          state: 'failed',
          failedReason: j.failedReason,
        })),
      ];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error getting recent jobs: ${message}`,
        stack,
      );
      throw error;
    }
  }
}
