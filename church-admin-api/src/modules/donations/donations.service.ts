import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  IsNull,
  MoreThanOrEqual,
  LessThanOrEqual,
  Not,
  Between,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DonationCampaign } from './entities/donation-campaign.entity';
import { DonationTransaction } from './entities/donation-transaction.entity';
import { ContentStatus, PaymentStatus } from '../../common/enums';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignQueryDto,
  RecordTransactionDto,
  CreateTransactionDto,
  TransactionQueryDto,
  DonationStatsDto,
  CampaignProgressDto,
} from './dto/donation.dto';
import { SlugUtil } from '../../common/utils/slug.util';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DonationsService {
  constructor(
    @InjectRepository(DonationCampaign)
    private campaignsRepository: Repository<DonationCampaign>,
    @InjectRepository(DonationTransaction)
    private transactionsRepository: Repository<DonationTransaction>,
  ) {}

  // ============= CAMPAIGN METHODS =============

  /**
   * Create a new donation campaign
   */
  async createCampaign(
    churchId: string,
    createCampaignDto: CreateCampaignDto,
    userId?: string,
  ): Promise<DonationCampaign> {
    // Generate unique slug
    const baseSlug = SlugUtil.generate(createCampaignDto.title);
    const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

    // Check if slug already exists
    const existing = await this.campaignsRepository.findOne({
      where: { slug, church_id: churchId, deleted_at: IsNull() },
    });

    if (existing) {
      throw new ConflictException(
        'Campaign with similar title already exists',
      );
    }

    const campaign = this.campaignsRepository.create({
      ...createCampaignDto,
      slug,
      church_id: churchId,
      status: createCampaignDto.status || ContentStatus.DRAFT,
      created_by: userId,
      updated_by: userId,
      start_date: new Date(createCampaignDto.start_date),
      end_date: createCampaignDto.end_date
        ? new Date(createCampaignDto.end_date)
        : null,
    });

    return this.campaignsRepository.save(campaign);
  }

  /**
   * Find all campaigns with filters and pagination
   */
  async findAllCampaigns(
    churchId: string,
    queryDto: CampaignQueryDto,
  ): Promise<PaginatedResponseDto<DonationCampaign>> {
    const {
      search,
      status,
      date_from,
      date_to,
      is_active,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = queryDto;

    const query = this.campaignsRepository
      .createQueryBuilder('campaign')
      .where('campaign.church_id = :churchId', { churchId })
      .andWhere('campaign.deleted_at IS NULL');

    // Apply search filter
    if (search) {
      query.andWhere(
        '(campaign.title ILIKE :search OR campaign.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply status filter
    if (status) {
      query.andWhere('campaign.status = :status', { status });
    }

    // Apply date range filter
    if (date_from && date_to) {
      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);
      query.andWhere(
        'campaign.start_date BETWEEN :fromDate AND :toDate',
        { fromDate, toDate },
      );
    } else if (date_from) {
      query.andWhere('campaign.start_date >= :fromDate', {
        fromDate: new Date(date_from),
      });
    } else if (date_to) {
      query.andWhere('campaign.end_date <= :toDate', {
        toDate: new Date(date_to),
      });
    }

    // Apply active filter
    if (is_active !== undefined) {
      const now = new Date();
      if (is_active) {
        query
          .andWhere('campaign.status = :status', { status: ContentStatus.PUBLISHED })
          .andWhere('campaign.start_date <= :now', { now })
          .andWhere(
            '(campaign.end_date IS NULL OR campaign.end_date >= :now)',
            { now },
          );
      }
    }

    // Get total count
    const total = await query.getCount();

    // Apply sorting
    const validSortFields = [
      'created_at',
      'start_date',
      'end_date',
      'title',
      'current_amount',
      'target_amount',
    ];
    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : 'created_at';
    query.orderBy(`campaign.${sortField}`, sort_order);

    // Apply pagination
    const offset = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    query.skip(offset).take(safeLimit);

    const items = await query.getMany();

    return new PaginatedResponseDto(
      items,
      Math.max(page, 1),
      safeLimit,
      total,
      { search, status, date_from, date_to, is_active },
    );
  }

  /**
   * Find a single campaign by ID
   */
  async findCampaign(churchId: string, id: string): Promise<DonationCampaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id, church_id: churchId, deleted_at: IsNull() },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  /**
   * Update a campaign
   */
  async updateCampaign(
    churchId: string,
    id: string,
    updateCampaignDto: UpdateCampaignDto,
    userId?: string,
  ): Promise<DonationCampaign> {
    const campaign = await this.findCampaign(churchId, id);

    // Generate new slug if title changed
    if (
      updateCampaignDto.title &&
      updateCampaignDto.title !== campaign.title
    ) {
      const baseSlug = SlugUtil.generate(updateCampaignDto.title);
      const slug = `${baseSlug}-${uuidv4().substring(0, 8)}`;

      const existing = await this.campaignsRepository.findOne({
        where: {
          slug,
          church_id: churchId,
          deleted_at: IsNull(),
          id: Not(id),
        },
      });

      if (existing) {
        throw new ConflictException(
          'A campaign with this title already exists',
        );
      }

      campaign.slug = slug;
    }

    Object.assign(campaign, {
      ...updateCampaignDto,
      updated_by: userId,
      start_date: updateCampaignDto.start_date
        ? new Date(updateCampaignDto.start_date)
        : campaign.start_date,
      end_date: updateCampaignDto.end_date
        ? new Date(updateCampaignDto.end_date)
        : campaign.end_date,
    });

    return this.campaignsRepository.save(campaign);
  }

  /**
   * Publish a campaign
   */
  async publishCampaign(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<DonationCampaign> {
    const campaign = await this.findCampaign(churchId, id);

    campaign.status = ContentStatus.PUBLISHED;
    campaign.published_at = new Date();
    campaign.updated_by = userId;

    return this.campaignsRepository.save(campaign);
  }

  /**
   * Archive a campaign
   */
  async archiveCampaign(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<DonationCampaign> {
    const campaign = await this.findCampaign(churchId, id);

    campaign.status = ContentStatus.ARCHIVED;
    campaign.updated_by = userId;

    return this.campaignsRepository.save(campaign);
  }

  /**
   * Delete (soft delete) a campaign
   */
  async deleteCampaign(
    churchId: string,
    id: string,
    userId?: string,
  ): Promise<DonationCampaign> {
    const campaign = await this.findCampaign(churchId, id);

    campaign.deleted_at = new Date();
    campaign.updated_by = userId;

    return this.campaignsRepository.save(campaign);
  }

  // ============= TRANSACTION METHODS =============

  /**
   * Record a new donation transaction (webhook-ready)
   */
  async recordTransaction(
    churchId: string,
    recordTransactionDto: RecordTransactionDto,
  ): Promise<DonationTransaction> {
    // Verify campaign exists and belongs to church
    const campaign = await this.findCampaign(
      churchId,
      recordTransactionDto.campaign_id,
    );

    // Create transaction
    const transaction = this.transactionsRepository.create({
      ...recordTransactionDto,
      church_id: churchId,
      campaign_id: recordTransactionDto.campaign_id,
      payment_provider: recordTransactionDto.payment_provider,
      status:
        recordTransactionDto.status ||
        PaymentStatus.PENDING,
    });

    // Save transaction
    const savedTransaction = await this.transactionsRepository.save(transaction);

    // Update campaign current_amount if transaction is completed
    if (savedTransaction.status === PaymentStatus.COMPLETED) {
      campaign.current_amount =
        (campaign.current_amount || 0) + recordTransactionDto.amount;
      await this.campaignsRepository.save(campaign);
    }

    return savedTransaction;
  }

  /**
   * Create a donation transaction (API endpoint)
   */
  async createTransaction(
    churchId: string,
    createTransactionDto: CreateTransactionDto,
  ): Promise<DonationTransaction> {
    // Verify campaign exists
    const campaign = await this.findCampaign(
      churchId,
      createTransactionDto.campaign_id,
    );

    if (campaign.status !== ContentStatus.PUBLISHED) {
      throw new BadRequestException('Campaign is not active');
    }

    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      church_id: churchId,
      campaign_id: createTransactionDto.campaign_id,
      payment_provider: 'manual', // API donations are marked as manual
      status: PaymentStatus.PENDING,
    });

    return this.transactionsRepository.save(transaction);
  }

  /**
   * Find all transactions with filters and pagination
   */
  async findTransactions(
    churchId: string,
    queryDto: TransactionQueryDto,
  ): Promise<PaginatedResponseDto<DonationTransaction>> {
    const {
      campaign_id,
      donor_name,
      donor_email,
      status,
      date_from,
      date_to,
      page = 1,
      limit = 20,
      sort_by = 'created_at',
      sort_order = 'DESC',
    } = queryDto;

    const query = this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.church_id = :churchId', { churchId });

    // Apply campaign filter
    if (campaign_id) {
      query.andWhere('transaction.campaign_id = :campaign_id', { campaign_id });
    }

    // Apply donor name filter
    if (donor_name) {
      query.andWhere('transaction.donor_name ILIKE :donor_name', {
        donor_name: `%${donor_name}%`,
      });
    }

    // Apply donor email filter
    if (donor_email) {
      query.andWhere('transaction.donor_email = :donor_email', {
        donor_email,
      });
    }

    // Apply status filter
    if (status) {
      query.andWhere('transaction.status = :status', { status });
    }

    // Apply date range filter
    if (date_from && date_to) {
      const fromDate = new Date(date_from);
      const toDate = new Date(date_to);
      query.andWhere(
        'transaction.created_at BETWEEN :fromDate AND :toDate',
        { fromDate, toDate },
      );
    } else if (date_from) {
      query.andWhere('transaction.created_at >= :fromDate', {
        fromDate: new Date(date_from),
      });
    } else if (date_to) {
      query.andWhere('transaction.created_at <= :toDate', {
        toDate: new Date(date_to),
      });
    }

    // Get total count
    const total = await query.getCount();

    // Apply sorting
    const validSortFields = [
      'created_at',
      'amount',
      'donor_name',
      'donor_email',
      'status',
    ];
    const sortField = validSortFields.includes(sort_by)
      ? sort_by
      : 'created_at';
    query.orderBy(`transaction.${sortField}`, sort_order);

    // Apply pagination
    const offset = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    query.skip(offset).take(safeLimit);

    const items = await query.getMany();

    return new PaginatedResponseDto(
      items,
      Math.max(page, 1),
      safeLimit,
      total,
      { campaign_id, donor_name, donor_email, status, date_from, date_to },
    );
  }

  /**
   * Get donation statistics
   */
  async getStats(churchId: string): Promise<DonationStatsDto> {
    const now = new Date();

    // Get total campaigns
    const totalCampaigns = await this.campaignsRepository.count({
      where: { church_id: churchId, deleted_at: IsNull() },
    });

    // Get active campaigns
    const activeCampaigns = await this.campaignsRepository.count({
      where: {
        church_id: churchId,
        status: ContentStatus.PUBLISHED,
        start_date: LessThanOrEqual(now),
        deleted_at: IsNull(),
      },
    });

    // Get total raised
    const totalRaisedResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.church_id = :churchId', { churchId })
      .andWhere('transaction.status = :status', {
        status: PaymentStatus.COMPLETED,
      })
      .select('SUM(transaction.amount)', 'total')
      .getRawOne();

    const totalRaised = totalRaisedResult?.total || 0;

    // Get by campaign
    const byCampaignResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect(
        'donation_campaigns',
        'campaign',
        'campaign.id = transaction.campaign_id',
      )
      .where('transaction.church_id = :churchId', { churchId })
      .andWhere('transaction.status = :status', {
        status: PaymentStatus.COMPLETED,
      })
      .groupBy('transaction.campaign_id')
      .addGroupBy('campaign.title')
      .select('transaction.campaign_id', 'campaign_id')
      .addSelect('campaign.title', 'campaign_title')
      .addSelect('SUM(transaction.amount)', 'amount')
      .addSelect('COUNT(transaction.id)', 'transaction_count')
      .getRawMany();

    const byCampaign = byCampaignResult.map((item) => ({
      campaign_id: item.campaign_id,
      campaign_title: item.campaign_title,
      amount: parseFloat(item.amount),
      transaction_count: parseInt(item.transaction_count),
      percentage: totalRaised > 0 ? (parseFloat(item.amount) / totalRaised) * 100 : 0,
    }));

    // Get by month
    const byMonthResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.church_id = :churchId', { churchId })
      .andWhere('transaction.status = :status', {
        status: PaymentStatus.COMPLETED,
      })
      .groupBy("DATE_TRUNC('month', transaction.created_at)")
      .select("DATE_TRUNC('month', transaction.created_at)", 'month')
      .addSelect('SUM(transaction.amount)', 'amount')
      .addSelect('COUNT(transaction.id)', 'transaction_count')
      .orderBy("DATE_TRUNC('month', transaction.created_at)", 'DESC')
      .getRawMany();

    const byMonth = byMonthResult.map((item) => ({
      month: item.month ? new Date(item.month).toISOString().split('T')[0] : null,
      amount: parseFloat(item.amount),
      transaction_count: parseInt(item.transaction_count),
    }));

    // Get by status
    const byStatusResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.church_id = :churchId', { churchId })
      .groupBy('transaction.status')
      .select('transaction.status', 'status')
      .addSelect('COUNT(transaction.id)', 'count')
      .addSelect('SUM(transaction.amount)', 'amount')
      .getRawMany();

    const byStatus: Record<string, { count: number; amount: number }> = {};
    byStatusResult.forEach((item) => {
      byStatus[item.status] = {
        count: parseInt(item.count),
        amount: parseFloat(item.amount),
      };
    });

    // Get total transactions
    const totalTransactions = await this.transactionsRepository.count({
      where: { church_id: churchId },
    });

    // Get recurring transactions
    const recurringTransactions = await this.transactionsRepository.count({
      where: { church_id: churchId, is_recurring: true },
    });

    // Get average, largest donation
    const statsResult = await this.transactionsRepository
      .createQueryBuilder('transaction')
      .where('transaction.church_id = :churchId', { churchId })
      .andWhere('transaction.status = :status', {
        status: PaymentStatus.COMPLETED,
      })
      .select('AVG(transaction.amount)', 'average')
      .addSelect('MAX(transaction.amount)', 'largest')
      .getRawOne();

    return {
      total_campaigns: totalCampaigns,
      active_campaigns: activeCampaigns,
      total_raised: parseFloat(totalRaised),
      by_campaign: byCampaign,
      by_month: byMonth,
      by_status: byStatus,
      total_transactions: totalTransactions,
      recurring_transactions: recurringTransactions,
      average_donation: statsResult?.average ? parseFloat(statsResult.average) : 0,
      largest_donation: statsResult?.largest ? parseFloat(statsResult.largest) : 0,
      currency: 'USD',
    };
  }

  /**
   * Get campaign progress
   */
  async getCampaignProgress(
    churchId: string,
    campaignId: string,
  ): Promise<CampaignProgressDto> {
    const campaign = await this.findCampaign(churchId, campaignId);

    const now = new Date();
    const daysRemaining = campaign.end_date
      ? Math.ceil(
          (campaign.end_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        )
      : -1;

    const transactionCount = await this.transactionsRepository.count({
      where: { campaign_id: campaignId },
    });

    const percentage =
      campaign.target_amount && campaign.target_amount > 0
        ? (campaign.current_amount / campaign.target_amount) * 100
        : 0;

    return {
      campaign_id: campaign.id,
      title: campaign.title,
      target_amount: campaign.target_amount || 0,
      current_amount: campaign.current_amount,
      currency: campaign.currency,
      percentage: Math.min(percentage, 100),
      transaction_count: transactionCount,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      is_active: campaign.status === ContentStatus.PUBLISHED && now >= campaign.start_date && (
        !campaign.end_date || now <= campaign.end_date
      ),
      days_remaining: daysRemaining,
    };
  }

  /**
   * Update transaction status (e.g., when payment provider webhook arrives)
   */
  async updateTransactionStatus(
    churchId: string,
    transactionId: string,
    status: PaymentStatus,
  ): Promise<DonationTransaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId, church_id: churchId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }

    const oldStatus = transaction.status;
    transaction.status = status;

    // If transitioning to completed, update campaign amount
    if (status === PaymentStatus.COMPLETED && oldStatus !== PaymentStatus.COMPLETED) {
      const campaign = await this.findCampaign(churchId, transaction.campaign_id);
      campaign.current_amount =
        (campaign.current_amount || 0) + transaction.amount;
      await this.campaignsRepository.save(campaign);
    }

    return this.transactionsRepository.save(transaction);
  }
}
