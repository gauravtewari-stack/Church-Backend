import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('Dashboard')
@ApiBearerAuth('Bearer')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview with key metrics' })
  @ApiResponse({ status: 200, description: 'Overview retrieved successfully', type: DashboardOverviewDto })
  async getOverview(@Req() req: any): Promise<DashboardOverviewDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getOverview(churchId);
  }

  @Get('content-stats')
  @ApiOperation({ summary: 'Get content breakdown statistics' })
  @ApiResponse({ status: 200, description: 'Content stats retrieved successfully', type: ContentBreakdownDto })
  async getContentStats(@Req() req: any): Promise<ContentBreakdownDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getContentStats(churchId);
  }

  @Get('recent-content')
  @ApiOperation({ summary: 'Get recent content items' })
  @ApiResponse({ status: 200, description: 'Recent content retrieved successfully' })
  async getRecentContent(@Req() req: any): Promise<any[]> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getRecentContent(churchId, 10);
  }

  @Get('donation-stats')
  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiResponse({ status: 200, description: 'Donation stats retrieved successfully', type: DonationStatsDto })
  async getDonationStats(@Req() req: any): Promise<DonationStatsDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getDonationStats(churchId);
  }

  @Get('upcoming-events')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved successfully', type: [UpcomingEventDto] })
  async getUpcomingEvents(@Req() req: any): Promise<UpcomingEventDto[]> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getUpcomingEvents(churchId, 5);
  }

  @Get('popular-content')
  @ApiOperation({ summary: 'Get popular content by engagement' })
  @ApiResponse({ status: 200, description: 'Popular content retrieved successfully', type: [PopularContentDto] })
  async getPopularContent(@Req() req: any): Promise<PopularContentDto[]> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getPopularContent(churchId);
  }

  @Get('storage')
  @ApiOperation({ summary: 'Get storage usage statistics' })
  @ApiResponse({ status: 200, description: 'Storage stats retrieved successfully', type: StorageStatsDto })
  async getStorageUsage(@Req() req: any): Promise<StorageStatsDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getStorageUsage(churchId);
  }

  @Get('plan-status')
  @ApiOperation({ summary: 'Get current plan status and limits' })
  @ApiResponse({ status: 200, description: 'Plan status retrieved successfully', type: PlanStatusDto })
  async getPlanStatus(@Req() req: any): Promise<PlanStatusDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getPlanStatus(churchId);
  }

  @Get('onboarding')
  @ApiOperation({ summary: 'Get onboarding completion status' })
  @ApiResponse({ status: 200, description: 'Onboarding status retrieved successfully', type: OnboardingStatusDto })
  async getOnboardingStatus(@Req() req: any): Promise<OnboardingStatusDto> {
    const churchId = req.user?.church_id;
    return this.dashboardService.getOnboardingStatus(churchId);
  }
}
