import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

/**
 * Public Module
 * Provides read-only API endpoints for publicly accessible church content
 * No authentication required - all endpoints are public
 */
@Module({
  controllers: [PublicController],
  providers: [PublicService],
  exports: [PublicService],
})
export class PublicModule {}
