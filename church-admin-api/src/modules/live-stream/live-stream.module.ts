import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveStreamEntity } from './entities/live-stream.entity';
import { LiveStreamService } from './live-stream.service';
import { LiveStreamController } from './live-stream.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LiveStreamEntity])],
  providers: [LiveStreamService],
  controllers: [LiveStreamController],
  exports: [LiveStreamService],
})
export class LiveStreamModule {}
