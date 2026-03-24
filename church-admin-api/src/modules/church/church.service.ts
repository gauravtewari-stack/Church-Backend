import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not } from 'typeorm';
import { Church, PlanType, ChurchSettings } from './entities/church.entity';
import {
  CreateChurchDto,
  UpdateChurchDto,
  OnboardingDto,
  UpdatePlanDto,
  ChurchResponseDto,
  ChurchUsageDto,
  ChurchQueryDto,
  PaginatedChurchesDto,
  ChurchSettingsDto,
} from './dto/church.dto';

interface CreateChurchPayload extends CreateChurchDto {
  email: string;
}

@Injectable()
export class ChurchService {
  constructor(
    @InjectRepository(Church)
    private readonly churchRepository: Repository<Church>,
  ) {}

  /**
   * Create a new church (tenant)
   */
  async create(createChurchDto: CreateChurchDto): Promise<ChurchResponseDto> {
    try {
      // Check if email already exists
      const existingEmail = await this.churchRepository.findOne({
        where: { email: createChurchDto.email },
        withDeleted: true,
      });

      if (existingEmail) {
        throw new ConflictException('Email already in use');
      }

      // Check if slug already exists
      const existingSlug = await this.churchRepository.findOne({
        where: { slug: createChurchDto.slug },
        withDeleted: true,
      });

      if (existingSlug) {
        throw new ConflictException('Slug already in use');
      }

      // Set default settings
      const defaultSettings: ChurchSettings = {
        max_sermons: this.getPlanLimits(createChurchDto.plan || PlanType.FREE)
          .max_sermons,
        max_events: this.getPlanLimits(createChurchDto.plan || PlanType.FREE)
          .max_events,
        max_storage_mb: this.getPlanLimits(
          createChurchDto.plan || PlanType.FREE,
        ).max_storage_mb,
        features_enabled: this.getPlanLimits(createChurchDto.plan || PlanType.FREE)
          .features_enabled,
      };

      const church = this.churchRepository.create({
        ...createChurchDto,
        settings: defaultSettings,
        plan: createChurchDto.plan || PlanType.FREE,
      });

      const saved = await this.churchRepository.save(church);
      return this.mapToDto(saved);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create church');
    }
  }

  /**
   * Find all churches with pagination and filtering
   */
  async findAll(query: ChurchQueryDto): Promise<PaginatedChurchesDto> {
    try {
      const page = Math.max(query.page || 1, 1);
      const limit = Math.min(Math.max(query.limit || 20, 1), 100);
      const skip = (page - 1) * limit;

      const where: any = { deleted_at: IsNull() };

      if (query.search) {
        where.name = Like(`%${query.search}%`);
      }

      if (query.plan) {
        where.plan = query.plan;
      }

      if (query.is_active !== undefined) {
        where.is_active = query.is_active;
      }

      const [churches, total] = await this.churchRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { created_at: 'DESC' },
      });

      const data = churches.map((church) => this.mapToDto(church));
      const pages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        pages,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch churches');
    }
  }

  /**
   * Find a single church by ID
   */
  async findOne(id: string): Promise<ChurchResponseDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      return this.mapToDto(church);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch church');
    }
  }

  /**
   * Update church details
   */
  async update(
    id: string,
    updateChurchDto: UpdateChurchDto,
  ): Promise<ChurchResponseDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      Object.assign(church, updateChurchDto);
      const updated = await this.churchRepository.save(church);

      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update church');
    }
  }

  /**
   * Complete church onboarding
   */
  async onboard(
    id: string,
    onboardingDto: OnboardingDto,
  ): Promise<ChurchResponseDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      Object.assign(church, {
        name: onboardingDto.name,
        logo_url: onboardingDto.logo_url,
        timezone: onboardingDto.timezone || church.timezone,
        primary_color: onboardingDto.primary_color,
        onboarding_completed: true,
      });

      const updated = await this.churchRepository.save(church);
      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to complete onboarding');
    }
  }

  /**
   * Update church plan
   */
  async updatePlan(
    id: string,
    updatePlanDto: UpdatePlanDto,
  ): Promise<ChurchResponseDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      const planLimits = this.getPlanLimits(updatePlanDto.plan);

      const updatedSettings: ChurchSettings = {
        ...church.settings,
        max_sermons: planLimits.max_sermons,
        max_events: planLimits.max_events,
        max_storage_mb: planLimits.max_storage_mb,
        features_enabled: planLimits.features_enabled,
      };

      church.plan = updatePlanDto.plan;
      church.plan_expires_at = updatePlanDto.plan_expires_at
        ? new Date(updatePlanDto.plan_expires_at)
        : null;
      church.settings = updatedSettings;

      const updated = await this.churchRepository.save(church);
      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update plan');
    }
  }

  /**
   * Update church settings
   */
  async updateSettings(
    id: string,
    settingsDto: ChurchSettingsDto,
  ): Promise<ChurchResponseDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      church.settings = {
        ...church.settings,
        ...settingsDto,
      };

      const updated = await this.churchRepository.save(church);
      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update settings');
    }
  }

  /**
   * Get church usage statistics (stub - requires additional entities)
   * This will be populated once Sermons and Events modules are created
   */
  async getUsage(churchId: string): Promise<ChurchUsageDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id: churchId, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      const maxSermons = church.settings?.max_sermons || 0;
      const maxEvents = church.settings?.max_events || 0;
      const maxStorageMb = church.settings?.max_storage_mb || 0;

      // TODO: Query actual sermon, event, and storage data once those modules are created
      return {
        church_id: church.id,
        sermons_count: 0,
        max_sermons: maxSermons,
        sermons_usage_percent: 0,
        events_count: 0,
        max_events: maxEvents,
        events_usage_percent: 0,
        storage_used_mb: 0,
        max_storage_mb: maxStorageMb,
        storage_usage_percent: 0,
        plan: church.plan,
        plan_expires_at: church.plan_expires_at,
        is_active: church.is_active,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch usage data');
    }
  }

  /**
   * Soft delete a church
   */
  async softDelete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: IsNull() },
      });

      if (!church) {
        throw new NotFoundException('Church not found');
      }

      await this.churchRepository.softDelete(id);

      return {
        success: true,
        message: 'Church soft deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete church');
    }
  }

  /**
   * Restore a soft-deleted church
   */
  async restore(id: string): Promise<ChurchResponseDto> {
    try {
      const church = await this.churchRepository.findOne({
        where: { id, deleted_at: Not(IsNull()) },
        withDeleted: true,
      });

      if (!church) {
        throw new NotFoundException('Church not found or is not deleted');
      }

      await this.churchRepository.restore(id);
      const restored = await this.churchRepository.findOne({
        where: { id },
      });

      return this.mapToDto(restored);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore church');
    }
  }

  /**
   * Get church by slug
   */
  async findBySlug(slug: string): Promise<Church> {
    const church = await this.churchRepository.findOne({
      where: { slug, deleted_at: IsNull() },
    });

    if (!church) {
      throw new NotFoundException('Church not found');
    }

    return church;
  }

  /**
   * Check if church email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where: any = { email };
    if (excludeId) {
      where.id = Not(excludeId);
    }

    const exists = await this.churchRepository.findOne({ where });
    return !!exists;
  }

  /**
   * Get plan limits based on plan type
   */
  private getPlanLimits(
    plan: PlanType,
  ): {
    max_sermons: number;
    max_events: number;
    max_storage_mb: number;
    features_enabled: string[];
  } {
    const limits = {
      [PlanType.FREE]: {
        max_sermons: 50,
        max_events: 10,
        max_storage_mb: 500,
        features_enabled: ['basic_sermons', 'basic_events'],
      },
      [PlanType.GROWTH]: {
        max_sermons: 500,
        max_events: 50,
        max_storage_mb: 5000,
        features_enabled: [
          'basic_sermons',
          'basic_events',
          'advanced_analytics',
          'giving_integration',
        ],
      },
      [PlanType.PRO]: {
        max_sermons: 5000,
        max_events: 500,
        max_storage_mb: 50000,
        features_enabled: [
          'basic_sermons',
          'basic_events',
          'advanced_analytics',
          'giving_integration',
          'custom_branding',
          'api_access',
          'priority_support',
        ],
      },
    };

    return limits[plan];
  }

  /**
   * Map church entity to response DTO
   */
  private mapToDto(church: Church): ChurchResponseDto {
    return {
      id: church.id,
      name: church.name,
      slug: church.slug,
      description: church.description,
      logo_url: church.logo_url,
      website_url: church.website_url,
      phone: church.phone,
      email: church.email,
      address: church.address,
      city: church.city,
      state: church.state,
      country: church.country,
      zip_code: church.zip_code,
      timezone: church.timezone,
      primary_color: church.primary_color,
      secondary_color: church.secondary_color,
      plan: church.plan,
      plan_expires_at: church.plan_expires_at,
      is_active: church.is_active,
      settings: church.settings,
      onboarding_completed: church.onboarding_completed,
      created_at: church.created_at,
      updated_at: church.updated_at,
    };
  }
}
