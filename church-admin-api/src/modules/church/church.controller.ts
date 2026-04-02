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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('Churches')
@ApiBearerAuth('Bearer')
@Controller('api/v1/churches')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Post()
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new church (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Church created successfully', type: ChurchResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  async create(
    @Body(ValidationPipe) createChurchDto: CreateChurchDto,
  ): Promise<ChurchResponseDto> {
    return this.churchService.create(createChurchDto);
  }

  @Get()
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Get all churches with pagination and filters (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Churches retrieved successfully', type: PaginatedChurchesDto })
  async findAll(
    @Query(ValidationPipe) query: ChurchQueryDto,
  ): Promise<PaginatedChurchesDto> {
    return this.churchService.findAll(query);
  }

  @Get(':id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get a specific church by ID' })
  @ApiResponse({ status: 200, description: 'Church retrieved successfully', type: ChurchResponseDto })
  @ApiResponse({ status: 404, description: 'Church not found' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Update church information' })
  @ApiResponse({ status: 200, description: 'Church updated successfully', type: ChurchResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updateChurchDto: UpdateChurchDto,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.update(id, updateChurchDto);
  }

  @Post(':id/onboard')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Complete church onboarding' })
  @ApiResponse({ status: 200, description: 'Onboarding completed successfully', type: ChurchResponseDto })
  async onboard(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) onboardingDto: OnboardingDto,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.onboard(id, onboardingDto);
  }

  @Patch(':id/plan')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Update church plan (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully', type: ChurchResponseDto })
  async updatePlan(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updatePlanDto: UpdatePlanDto,
  ): Promise<ChurchResponseDto> {
    return this.churchService.updatePlan(id, updatePlanDto);
  }

  @Patch(':id/settings')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Update church settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully', type: ChurchResponseDto })
  async updateSettings(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) settingsDto: ChurchSettingsDto,
    @User() user: AuthUser,
  ): Promise<ChurchResponseDto> {
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.updateSettings(id, settingsDto);
  }

  @Get(':id/usage')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get church usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage stats retrieved successfully', type: ChurchUsageDto })
  async getUsage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<ChurchUsageDto> {
    if (user.role !== 'super_admin' && user.church_id !== id) {
      throw new Error('Unauthorized');
    }

    return this.churchService.getUsage(id);
  }

  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a church (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Church deleted successfully' })
  async softDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.churchService.softDelete(id);
  }

  @Post(':id/restore')
  @UseGuards(SuperAdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted church (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Church restored successfully', type: ChurchResponseDto })
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ChurchResponseDto> {
    return this.churchService.restore(id);
  }
}
