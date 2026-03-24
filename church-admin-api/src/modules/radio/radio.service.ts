import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { RadioStationEntity } from './entities/radio-station.entity';
import { CreateRadioDto, UpdateRadioDto, RadioQueryDto } from './dto/radio.dto';

@Injectable()
export class RadioService {
  constructor(
    @InjectRepository(RadioStationEntity)
    private radioRepository: Repository<RadioStationEntity>,
  ) {}

  /**
   * Generate unique slug
   */
  private async generateSlug(title: string, churchId: string): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    const uniqueSuffix = uuidv4().substring(0, 8);
    const slug = `${baseSlug}-${uniqueSuffix}`;

    const exists = await this.radioRepository.findOne({
      where: { slug, church_id: churchId },
      withDeleted: true,
    });

    return exists ? await this.generateSlug(`${title}-${uuidv4().substring(0, 4)}`, churchId) : slug;
  }

  /**
   * Create radio station
   */
  async create(churchId: string, createDto: CreateRadioDto, createdBy: string): Promise<RadioStationEntity> {
    const slug = await this.generateSlug(createDto.title, churchId);

    const station = this.radioRepository.create({
      church_id: churchId,
      slug,
      ...createDto,
      status: createDto.is_active ? 'active' : 'inactive',
      created_by: createdBy,
    });

    return this.radioRepository.save(station);
  }

  /**
   * Get all radio stations with pagination and filters
   */
  async findAll(churchId: string, query: RadioQueryDto): Promise<{ items: RadioStationEntity[]; meta: any }> {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    let queryBuilder = this.radioRepository
      .createQueryBuilder('station')
      .where('station.church_id = :churchId', { churchId });

    // Apply filters
    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        '(station.title ILIKE :search OR station.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.is_active !== undefined) {
      queryBuilder = queryBuilder.andWhere('station.is_active = :active', {
        active: query.is_active,
      });
    }

    // Apply sorting
    const sortField = query.sort || '-created_at';
    const [field, direction] = sortField.startsWith('-')
      ? [sortField.substring(1), 'DESC']
      : [sortField, 'ASC'];

    const validFields = ['title', 'created_at', 'updated_at'];
    if (validFields.includes(field)) {
      queryBuilder = queryBuilder.orderBy(`station.${field}`, direction as 'ASC' | 'DESC');
    }

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single radio station
   */
  async findOne(churchId: string, id: string): Promise<RadioStationEntity> {
    const station = await this.radioRepository.findOne({
      where: { id, church_id: churchId },
    });

    if (!station) {
      throw new NotFoundException(`Radio station with ID ${id} not found`);
    }

    return station;
  }

  /**
   * Update radio station
   */
  async update(churchId: string, id: string, updateDto: UpdateRadioDto): Promise<RadioStationEntity> {
    const station = await this.findOne(churchId, id);

    if (updateDto.title && updateDto.title !== station.title) {
      station.slug = await this.generateSlug(updateDto.title, churchId);
    }

    if (updateDto.is_active !== undefined) {
      station.is_active = updateDto.is_active;
      station.status = updateDto.is_active ? 'active' : 'inactive';
    }

    Object.assign(station, updateDto);
    return this.radioRepository.save(station);
  }

  /**
   * Soft delete radio station
   */
  async remove(churchId: string, id: string): Promise<void> {
    const station = await this.findOne(churchId, id);
    await this.radioRepository.softRemove(station);
  }

  /**
   * Restore soft deleted radio station
   */
  async restore(churchId: string, id: string): Promise<RadioStationEntity> {
    const station = await this.radioRepository.findOne({
      where: { id, church_id: churchId },
      withDeleted: true,
    });

    if (!station) {
      throw new NotFoundException(`Radio station with ID ${id} not found`);
    }

    return this.radioRepository.recover(station);
  }

  /**
   * Activate radio station
   */
  async activate(churchId: string, id: string): Promise<RadioStationEntity> {
    const station = await this.findOne(churchId, id);
    station.is_active = true;
    station.status = 'active';
    return this.radioRepository.save(station);
  }

  /**
   * Deactivate radio station
   */
  async deactivate(churchId: string, id: string): Promise<RadioStationEntity> {
    const station = await this.findOne(churchId, id);
    station.is_active = false;
    station.status = 'inactive';
    return this.radioRepository.save(station);
  }

  /**
   * Get active stations
   */
  async getActiveStations(churchId: string): Promise<RadioStationEntity[]> {
    return this.radioRepository.find({
      where: {
        church_id: churchId,
        is_active: true,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Get statistics
   */
  async getStats(churchId: string): Promise<{ total: number; active: number; inactive: number }> {
    const total = await this.radioRepository.count({
      where: { church_id: churchId },
    });

    const active = await this.radioRepository.count({
      where: { church_id: churchId, is_active: true },
    });

    return {
      total,
      active,
      inactive: total - active,
    };
  }

  /**
   * Get empty state message
   */
  getEmptyState(): { message: string; action: string } {
    return {
      message: 'No radio stations found. Create your first station to get started.',
      action: 'Create Station',
    };
  }
}
