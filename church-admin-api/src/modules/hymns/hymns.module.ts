import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HymnEntity } from './entities/hymn.entity';
import { HymnsService } from './hymns.service';
import { HymnsController } from './hymns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HymnEntity])],
  providers: [HymnsService],
  controllers: [HymnsController],
  exports: [HymnsService],
})
export class HymnsModule {}
