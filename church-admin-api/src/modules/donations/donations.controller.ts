import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CurrentChurch } from '../../common/decorators/current-church.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignQueryDto,
  CreateTransactionDto,
  UpdateTransactionDto,
  TransactionQueryDto,
  DonationStatsDto,
  CampaignProgressDto,
  CampaignResponseDto,
  TransactionResponseDto,
} from './dto/donation.dto';
import { DonationCampaign } from './entities/donation-campaign.entity';
import { DonationTransaction } from './entities/donation-transaction.entity';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@ApiTags('Donations')
@ApiBearerAuth()
@Controller('api/v1/donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  // ============= CAMPAIGN ENDPOINTS =============

  /**
   * Create a new donation campaign
   */
  @Post('campaigns')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new donation campaign' })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: DonationCampaign,
  })
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: DonationCampaign }> {
    const campaign = await this.donationsService.createCampaign(
      churchId,
      createCampaignDto,
      user?.id,
    );

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Get all donation campaigns with filters and pagination
   */
  @Get('campaigns')
  @ApiOperation({ summary: 'Get all donation campaigns with filters' })
  @ApiResponse({
    status: 200,
    description: 'Campaigns retrieved successfully',
    type: PaginatedResponseDto,
  })
  async findAllCampaigns(
    @Query() queryDto: CampaignQueryDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: PaginatedResponseDto<DonationCampaign> }> {
    const result = await this.donationsService.findAllCampaigns(
      churchId,
      queryDto,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get a single campaign by ID
   */
  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get a single campaign by ID' })
  @ApiResponse({
    status: 200,
    description: 'Campaign retrieved successfully',
    type: DonationCampaign,
  })
  async findCampaign(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: DonationCampaign }> {
    const campaign = await this.donationsService.findCampaign(churchId, id);

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Update a campaign
   */
  @Patch('campaigns/:id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    type: DonationCampaign,
  })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: DonationCampaign }> {
    const campaign = await this.donationsService.updateCampaign(
      churchId,
      id,
      updateCampaignDto,
      user?.id,
    );

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Publish a campaign
   */
  @Post('campaigns/:id/publish')
  @ApiOperation({ summary: 'Publish a campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign published successfully',
    type: DonationCampaign,
  })
  async publishCampaign(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: DonationCampaign }> {
    const campaign = await this.donationsService.publishCampaign(
      churchId,
      id,
      user?.id,
    );

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Archive a campaign
   */
  @Post('campaigns/:id/archive')
  @ApiOperation({ summary: 'Archive a campaign' })
  @ApiResponse({
    status: 200,
    description: 'Campaign archived successfully',
    type: DonationCampaign,
  })
  async archiveCampaign(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; data: DonationCampaign }> {
    const campaign = await this.donationsService.archiveCampaign(
      churchId,
      id,
      user?.id,
    );

    return {
      success: true,
      data: campaign,
    };
  }

  /**
   * Delete (soft delete) a campaign
   */
  @Delete('campaigns/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a campaign (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Campaign deleted successfully',
  })
  async deleteCampaign(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
    @CurrentUser() user: any,
  ): Promise<{ success: boolean; message: string }> {
    await this.donationsService.deleteCampaign(churchId, id, user?.id);

    return {
      success: true,
      message: 'Campaign deleted successfully',
    };
  }

  /**
   * Get campaign progress
   */
  @Get('campaigns/:id/progress')
  @ApiOperation({ summary: 'Get campaign progress' })
  @ApiResponse({
    status: 200,
    description: 'Campaign progress retrieved successfully',
    type: CampaignProgressDto,
  })
  async getCampaignProgress(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: CampaignProgressDto }> {
    const progress = await this.donationsService.getCampaignProgress(churchId, id);

    return {
      success: true,
      data: progress,
    };
  }

  // ============= TRANSACTION ENDPOINTS =============

  /**
   * Create a new donation transaction (API)
   */
  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new donation transaction' })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: DonationTransaction,
  })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: DonationTransaction }> {
    const transaction = await this.donationsService.createTransaction(
      churchId,
      createTransactionDto,
    );

    return {
      success: true,
      data: transaction,
    };
  }

  /**
   * Get all transactions for a campaign with filters
   */
  @Get('campaigns/:id/transactions')
  @ApiOperation({ summary: 'Get all transactions for a campaign' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: PaginatedResponseDto,
  })
  async getCampaignTransactions(
    @Param('id') campaignId: string,
    @Query() queryDto: TransactionQueryDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: PaginatedResponseDto<DonationTransaction> }> {
    queryDto.campaign_id = campaignId;
    const result = await this.donationsService.findTransactions(
      churchId,
      queryDto,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get all transactions with filters and pagination
   */
  @Get('transactions')
  @ApiOperation({ summary: 'Get all transactions with filters' })
  @ApiResponse({
    status: 200,
    description: 'Transactions retrieved successfully',
    type: PaginatedResponseDto,
  })
  async findAllTransactions(
    @Query() queryDto: TransactionQueryDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: PaginatedResponseDto<DonationTransaction> }> {
    const result = await this.donationsService.findTransactions(
      churchId,
      queryDto,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Update a donation transaction
   */
  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update a donation transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction updated successfully',
    type: DonationTransaction,
  })
  async updateTransaction(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: DonationTransaction }> {
    const transaction = await this.donationsService.updateTransaction(
      churchId,
      id,
      updateTransactionDto,
    );

    return {
      success: true,
      data: transaction,
    };
  }

  /**
   * Delete a donation transaction
   */
  @Delete('transactions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a donation transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction deleted successfully',
  })
  async deleteTransaction(
    @Param('id') id: string,
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.donationsService.deleteTransaction(churchId, id);

    return {
      success: true,
      message: 'Transaction deleted successfully',
    };
  }

  /**
   * Get donation statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get donation statistics' })
  @ApiResponse({
    status: 200,
    description: 'Donation statistics retrieved successfully',
    type: DonationStatsDto,
  })
  async getStats(
    @CurrentChurch() churchId: string,
  ): Promise<{ success: boolean; data: DonationStatsDto }> {
    const stats = await this.donationsService.getStats(churchId);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Webhook endpoint for payment provider notifications
   * No authentication required - validates via signature
   */
  @Post('webhook')
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook endpoint for payment provider notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
  })
  async handleWebhook(
    @Body() body: any,
    @Query('church_id') churchId?: string,
  ): Promise<{ success: boolean; message: string }> {
    // In a real implementation, you would:
    // 1. Verify the webhook signature with the payment provider
    // 2. Extract transaction details from the webhook payload
    // 3. Call recordTransaction or updateTransactionStatus accordingly

    // This is a placeholder that accepts the webhook
    // Implement signature verification based on your payment provider

    if (!body) {
      throw new BadRequestException('Invalid webhook payload');
    }

    // TODO: Implement webhook processing logic based on payment provider

    return {
      success: true,
      message: 'Webhook processed successfully',
    };
  }
}

// Import BadRequestException for webhook validation
import { BadRequestException } from '@nestjs/common';
