import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SortOrder } from '../enums';

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page (max 100)', default: 20, example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search query string' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', example: 'created_at' })
  @IsOptional()
  @IsString()
  sort_by?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toUpperCase())
  sort_order?: SortOrder = SortOrder.DESC;

  /**
   * Calculate offset for database queries
   */
  getOffset(): number {
    const page = Math.max(this.page || 1, 1);
    const limit = this.limit || 20;
    return (page - 1) * limit;
  }

  /**
   * Get safe limit value
   */
  getLimit(): number {
    return Math.min(Math.max(this.limit || 20, 1), 100);
  }

  /**
   * Get current page
   */
  getPage(): number {
    return Math.max(this.page || 1, 1);
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 }) page: number;
  @ApiProperty({ example: 20 }) limit: number;
  @ApiProperty({ example: 100 }) total: number;
  @ApiProperty({ example: 5 }) total_pages: number;
  @ApiProperty({ example: true }) has_next: boolean;
  @ApiProperty({ example: false }) has_prev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.total_pages = Math.ceil(total / limit);
    this.has_next = page < this.total_pages;
    this.has_prev = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: PaginationMetaDto;
  filters?: Record<string, any>;

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    filters?: Record<string, any>,
  ) {
    this.data = data;
    this.pagination = new PaginationMetaDto(page, limit, total);
    if (filters) {
      this.filters = filters;
    }
  }
}
