import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RadioService } from './radio.service';
import { CreateRadioDto, UpdateRadioDto, RadioQueryDto } from './dto/radio.dto';

// Import your auth guard here - adjust based on your auth setup
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/v1/radio')
// @UseGuards(JwtAuthGuard)
export class RadioController {
  constructor(private readonly radioService: RadioService) {}

  /**
   * GET /api/v1/radio
   * List all radio stations with pagination and filters
   */
  @Get()
  async findAll(@Request() req: any, @Query() query: RadioQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.findAll(churchId, query);
  }

  /**
   * POST /api/v1/radio
   * Create new radio station
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: any, @Body() createDto: CreateRadioDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.radioService.create(churchId, createDto, userId);
  }

  /**
   * GET /api/v1/radio/active
   * Get active stations
   */
  @Get('active')
  async getActiveStations(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.getActiveStations(churchId);
  }

  /**
   * GET /api/v1/radio/stats
   * Get statistics
   */
  @Get('stats')
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.getStats(churchId);
  }

  /**
   * GET /api/v1/radio/empty-state
   * Get empty state
   */
  @Get('empty-state')
  async getEmptyState() {
    return this.radioService.getEmptyState();
  }

  /**
   * GET /api/v1/radio/:id
   * Get single radio station
   */
  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.findOne(churchId, id);
  }

  /**
   * PATCH /api/v1/radio/:id
   * Update radio station
   */
  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateRadioDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.update(churchId, id, updateDto);
  }

  /**
   * DELETE /api/v1/radio/:id
   * Delete radio station (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.radioService.remove(churchId, id);
  }

  /**
   * PATCH /api/v1/radio/:id/restore
   * Restore soft deleted radio station
   */
  @Patch(':id/restore')
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.restore(churchId, id);
  }

  /**
   * PATCH /api/v1/radio/:id/activate
   * Activate radio station
   */
  @Patch(':id/activate')
  async activate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.activate(churchId, id);
  }

  /**
   * PATCH /api/v1/radio/:id/deactivate
   * Deactivate radio station
   */
  @Patch(':id/deactivate')
  async deactivate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.deactivate(churchId, id);
  }
}
