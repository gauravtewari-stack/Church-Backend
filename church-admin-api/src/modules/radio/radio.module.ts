import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RadioStationEntity } from './entities/radio-station.entity';
import { RadioService } from './radio.service';
import { RadioController } from './radio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RadioStationEntity])],
  providers: [RadioService],
  controllers: [RadioController],
  exports: [RadioService],
})
export class RadioModule {}
