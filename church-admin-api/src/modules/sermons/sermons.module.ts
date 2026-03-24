import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sermon } from './entities/sermon.entity';
import { SermonCategory } from './entities/sermon-category.entity';
import { SermonsService } from './sermons.service';
import { SermonsController } from './sermons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sermon, SermonCategory])],
  controllers: [SermonsController],
  providers: [SermonsService],
  exports: [SermonsService],
})
export class SermonsModule {}
