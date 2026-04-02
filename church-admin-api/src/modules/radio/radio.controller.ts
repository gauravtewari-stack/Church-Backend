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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RadioService } from './radio.service';
import { CreateRadioDto, UpdateRadioDto, RadioQueryDto } from './dto/radio.dto';

@ApiTags('Radio Stations')
@ApiBearerAuth('Bearer')
@Controller('api/v1/radio')
export class RadioController {
  constructor(private readonly radioService: RadioService) {}

  @Get()
  @ApiOperation({ summary: 'List all radio stations with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Radio stations retrieved successfully' })
  async findAll(@Request() req: any, @Query() query: RadioQueryDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.findAll(churchId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new radio station' })
  @ApiResponse({ status: 201, description: 'Radio station created successfully' })
  async create(@Request() req: any, @Body() createDto: CreateRadioDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    const userId = req.user?.id || req.headers['x-user-id'];
    return this.radioService.create(churchId, createDto, userId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active radio stations' })
  @ApiResponse({ status: 200, description: 'Active stations retrieved' })
  async getActiveStations(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.getActiveStations(churchId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get radio station statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(@Request() req: any) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.getStats(churchId);
  }

  @Get('empty-state')
  @ApiOperation({ summary: 'Get empty state configuration' })
  @ApiResponse({ status: 200, description: 'Empty state retrieved' })
  async getEmptyState() {
    return this.radioService.getEmptyState();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single radio station by ID' })
  @ApiResponse({ status: 200, description: 'Radio station retrieved' })
  @ApiResponse({ status: 404, description: 'Radio station not found' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.findOne(churchId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a radio station' })
  @ApiResponse({ status: 200, description: 'Radio station updated' })
  async update(@Request() req: any, @Param('id') id: string, @Body() updateDto: UpdateRadioDto) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.update(churchId, id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a radio station (soft delete)' })
  @ApiResponse({ status: 204, description: 'Radio station deleted' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    await this.radioService.remove(churchId, id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restore a soft-deleted radio station' })
  @ApiResponse({ status: 200, description: 'Radio station restored' })
  async restore(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.restore(churchId, id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a radio station' })
  @ApiResponse({ status: 200, description: 'Radio station activated' })
  async activate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.activate(churchId, id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a radio station' })
  @ApiResponse({ status: 200, description: 'Radio station deactivated' })
  async deactivate(@Request() req: any, @Param('id') id: string) {
    const churchId = req.user?.church_id || req.headers['x-church-id'];
    return this.radioService.deactivate(churchId, id);
  }
}
