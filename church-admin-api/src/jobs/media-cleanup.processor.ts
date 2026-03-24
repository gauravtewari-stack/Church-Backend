import { Processor, Process } from '@nestjs/bull';
import { Logger, Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';

/**
 * Media Cleanup Processor
 * Cleans up orphaned and soft-deleted media files that are older than 30 days.
 * Runs periodically to free up storage and maintain database cleanliness.
 */
@Injectable()
@Processor('media-cleanup')
export class MediaCleanupProcessor {
  private readonly logger = new Logger(MediaCleanupProcessor.name);

  // Media files older than 30 days will be cleaned up
  private readonly CLEANUP_DAYS = 30;

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Main process handler for media cleanup
   * Identifies and removes soft-deleted media older than 30 days
   */
  @Process()
  async handleMediaCleanup(job: Job): Promise<void> {
    try {
      this.logger.log(`Starting media cleanup job`);

      // Calculate date threshold (30 days ago)
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - this.CLEANUP_DAYS);

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      try {
        // Find soft-deleted media older than threshold
        const oldDeletedMedia = await queryRunner.manager.find('media', {
          where: {
            deleted_at: LessThan(thresholdDate),
          },
        }) as any[];

        this.logger.log(
          `Found ${oldDeletedMedia.length} media files eligible for cleanup`,
        );

        if (oldDeletedMedia.length === 0) {
          job.progress(100);
          return;
        }

        // Extract file URLs for deletion (e.g., from S3, local storage, etc.)
        const mediaIds = oldDeletedMedia.map((m) => m.id);

        // Attempt to delete from storage service
        // This assumes you have a storage service that handles S3, local, etc.
        // For now, we'll just log which files would be deleted
        for (const media of oldDeletedMedia) {
          try {
            await this.deleteMediaFile(media);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            const stack = error instanceof Error ? error.stack : '';
            this.logger.error(
              `Failed to delete media file ${media.id}: ${message}`,
              stack,
            );
            // Continue with other files even if one fails
          }
        }

        // Permanently delete records from database (hard delete)
        const deleteResult = await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('media')
          .where('id IN (:...ids)', { ids: mediaIds })
          .andWhere('deleted_at < :threshold', { threshold: thresholdDate })
          .execute();

        const deletedCount = deleteResult.affected || 0;
        this.logger.log(`Successfully hard-deleted ${deletedCount} media records`);

        // Also clean up media_usage entries for deleted media
        const usageDeleteResult = await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('media_usage')
          .where('media_id IN (:...ids)', { ids: mediaIds })
          .execute();

        this.logger.log(
          `Cleaned up ${usageDeleteResult.affected || 0} media usage records`,
        );

        job.progress(100);
      } finally {
        await queryRunner.release();
      }

      this.logger.log(`Media cleanup job completed successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error in media cleanup job: ${message}`,
        stack,
      );
      throw error;
    }
  }

  /**
   * Delete media file from storage
   * This is a placeholder - implement based on your storage backend
   * (S3, local filesystem, CloudStorage, etc.)
   */
  private async deleteMediaFile(media: any): Promise<void> {
    try {
      // Placeholder: implement based on your storage solution
      // Examples:
      // - For S3: await this.s3Service.deleteObject(media.file_path)
      // - For local: await fs.promises.unlink(media.file_path)
      // - For Cloud Storage: await this.gcsService.deleteFile(media.file_path)

      this.logger.debug(
        `Deleting media file from storage: ${media.file_path || media.id}`,
      );

      // Simulated storage deletion - replace with actual implementation
      // Example for local filesystem:
      // const path = require('path');
      // const fs = require('fs').promises;
      // try {
      //   await fs.unlink(media.file_path);
      // } catch (err) {
      //   if (err.code !== 'ENOENT') throw err; // Ignore if file doesn't exist
      // }

      // Example for S3 (if using AWS SDK):
      // await this.s3Client.deleteObject({
      //   Bucket: process.env.AWS_S3_BUCKET,
      //   Key: media.s3_key,
      // }).promise();

      // For now, just log that we would delete it
      this.logger.debug(
        `[Simulated] Would delete media file: ${media.file_path || media.id}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(
        `Error deleting media file ${media.id}: ${message}`,
        stack,
      );
      // Re-throw to be caught by caller
      throw error;
    }
  }
}
