import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpiritualResourceEntity } from './entities/spiritual-resource.entity';
import { SpiritualLibraryService } from './spiritual-library.service';
import { SpiritualLibraryController } from './spiritual-library.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SpiritualResourceEntity])],
  providers: [SpiritualLibraryService],
  controllers: [SpiritualLibraryController],
  exports: [SpiritualLibraryService],
})
export class SpiritualLibraryModule {}
