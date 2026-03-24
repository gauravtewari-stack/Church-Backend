import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DashboardOverviewDto,
  ContentBreakdownDto,
  DonationStatsDto,
  UpcomingEventDto,
  PopularContentDto,
  StorageStatsDto,
  PlanStatusDto,
  OnboardingStatusDto,
} from './dto/dashboard.dto';

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  async getOverview(@Req() req: any): Promise<DashboardOverviewDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getOverview(churchId);
  }

  @Get('content-stats')
  async getContentStats(@Req() req: any): Promise<ContentBreakdownDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getContentStats(churchId);
  }

  @Get('recent-content')
  async getRecentContent(@Req() req: any): Promise<any[]> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getRecentContent(churchId, 10);
  }

  @Get('donation-stats')
  async getDonationStats(@Req() req: any): Promise<DonationStatsDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getDonationStats(churchId);
  }

  @Get('upcoming-events')
  async getUpcomingEvents(@Req() req: any): Promise<UpcomingEventDto[]> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getUpcomingEvents(churchId, 5);
  }

  @Get('popular-content')
  async getPopularContent(@Req() req: any): Promise<PopularContentDto[]> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getPopularContent(churchId);
  }

  @Get('storage')
  async getStorageUsage(@Req() req: any): Promise<StorageStatsDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getStorageUsage(churchId);
  }

  @Get('plan-status')
  async getPlanStatus(@Req() req: any): Promise<PlanStatusDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getPlanStatus(churchId);
  }

  @Get('onboarding')
  async getOnboardingStatus(@Req() req: any): Promise<OnboardingStatusDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getOnboardingStatus(churchId);
  }
}
