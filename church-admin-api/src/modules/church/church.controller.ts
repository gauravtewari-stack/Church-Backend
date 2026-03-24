import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChurchService } from './church.service';
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
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { ChurchGuard } from '../../common/guards/church.guard';
import { User } from '../../common/decorators/user.decorator';
import { CurrentChurch } from '../../common/decorators/current-church.decorator';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';

interface AuthUser {
  id: string;
  role: string;
  church_id?: string;
}

interface ChurchContext {
  id: string;
}

@Controller('api/v1/churches')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  /**
   * Create a new church (Super Admin only)
   * POST /api/v1/churches
   */
  @Post()
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createChurchDto: CreateChurchDto,
  ): Promise<ChurchResponseDto> {
    return this.churchService.create(createChurchDto);
  }

  /**
   * Get all churches with pagination and filters (Super Admin only)
   * GET /api/v1/churches
   */
  @Get()
  @UseGuards(SuperAdminGuard)
  async findAll(
    @Query(ValidationPipe) query: ChurchQueryDto,
  ): Promise<PaginatedChurchesDto> {
    return this.churchService.findAll(query);
  }

  /**
   * Get a specific church by ID
   * GET /api/v1/churches/:id
   */
  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    // Super admins can access any church, others can only access their own
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.findOne(id);
  }

  /**
   * Update church information
   * PATCH /api/v1/churches/:id
   */
  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updateChurchDto: UpdateChurchDto,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    // Verify authorization
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.update(id, updateChurchDto);
  }

  /**
   * Complete church onboarding
   * POST /api/v1/churches/:id/onboard
   */
  @Post(':id/onboard')
  @UseGuards(AuthenticatedGuard)
  async onboard(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) onboardingDto: OnboardingDto,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    // Verify authorization
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.onboard(id, onboardingDto);
  }

  /**
   * Update church plan
   * PATCH /api/v1/churches/:id/plan
   */
  @Patch(':id/plan')
  @UseGuards(SuperAdminGuard)
  async updatePlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updatePlanDto: UpdatePlanDto,
  ): Promise<ChurchResponseDto> {
    return this.churchService.updatePlan(id, updatePlanDto);
  }

  /**
   * Update church settings
   * PATCH /api/v1/churches/:id/settings
   */
  @Patch(':id/settings')
  @UseGuards(AuthenticatedGuard)
  async updateSettings(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) settingsDto: ChurchSettingsDto,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    // Verify authorization
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.updateSettings(id, settingsDto);
  }

  /**
   * Get church usage statistics
   * GET /api/v1/churches/:id/usage
   */
  @Get(':id/usage')
  @UseGuards(AuthenticatedGuard)
  async getUsage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<ChurchUsageDto> {
    // Verify authorization
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.getUsage(id);
  }

  /**
   * Soft delete a church (Super Admin only)
   * DELETE /api/v1/churches/:id
   */
  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  async softDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.churchService.softDelete(id);
  }

  /**
   * Restore a soft-deleted church (Super Admin only)
   * POST /api/v1/churches/:id/restore
   */
  @Post(':id/restore')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ChurchResponseDto> {
    return this.churchService.restore(id);
  }
}
