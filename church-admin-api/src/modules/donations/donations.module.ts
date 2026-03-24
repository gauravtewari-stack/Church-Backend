import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationCampaign } from './entities/donation-campaign.entity';
import { DonationTransaction } from './entities/donation-transaction.entity';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DonationCampaign, DonationTransaction]),
  ],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
