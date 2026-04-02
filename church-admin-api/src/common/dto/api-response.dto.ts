import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination.dto';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Whether the request was successful', example: true }) success: boolean;
  @ApiProperty({ description: 'Response data' }) data: T;
  @ApiPropertyOptional({ description: 'Response message' }) message?: string;
  meta?: {
    pagination?: PaginationMetaDto;
    filters?: Record<string, any>;
    timestamp?: string;
    path?: string;
    version?: string;
  };
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;

  constructor(
    success: boolean,
    data: T,
    message?: string,
    meta?: ApiResponseDto<T>['meta'],
  ) {
    this.success = success;
    this.data = data;
    if (message) {
      this.message = message;
    }
    if (meta) {
      this.meta = meta;
    }
  }

  /**
   * Create a successful response
   */
  static success<T>(
    data: T,
    message?: string,
    meta?: ApiResponseDto<T>['meta'],
  ): ApiResponseDto<T> {
    return new ApiResponseDto(true, data, message, meta);
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
    filters?: Record<string, any>,
  ): ApiResponseDto<T[]> {
    return new ApiResponseDto(
      true,
      data,
      message || 'Success',
      {
        pagination: new PaginationMetaDto(page, limit, total),
        filters,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Create an error response
   */
  static error<T>(
    message: string,
    errors?: ApiResponseDto<T>['errors'],
    data?: T,
  ): ApiResponseDto<T | null> {
    const response = new ApiResponseDto(false, data || (null as any), message, {
      timestamp: new Date().toISOString(),
    });
    if (errors) {
      response.errors = errors;
    }
    return response;
  }

  /**
   * Create a validation error response
   */
  static validationError<T>(
    message: string,
    errors: Array<{ field: string; message: string }>,
  ): ApiResponseDto<null> {
    return {
      success: false,
      data: null,
      message,
      errors: errors.map((err) => ({
        field: err.field,
        message: err.message,
        code: 'VALIDATION_ERROR',
      })),
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
