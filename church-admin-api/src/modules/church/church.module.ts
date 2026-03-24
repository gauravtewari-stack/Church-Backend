import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Church } from './entities/church.entity';
import { ChurchService } from './church.service';
import { ChurchController } from './church.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Church])],
  providers: [ChurchService],
  controllers: [ChurchController],
  exports: [ChurchService],
})
export class ChurchModule {}
