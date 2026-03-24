import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';
import { PaginatedResponseDto } from '../dto/pagination.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponseDto<any>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      map((data) => {
        // If the response is already an ApiResponseDto, return as-is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data
        ) {
          return data;
        }

        // If the response is a paginated response, wrap it
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'pagination' in data
        ) {
          const paginatedData = data as PaginatedResponseDto<any>;
          return ApiResponseDto.paginated(
            paginatedData.data,
            paginatedData.pagination.page,
            paginatedData.pagination.limit,
            paginatedData.pagination.total,
            'Success',
            paginatedData.filters,
          );
        }

        // Wrap regular responses
        return new ApiResponseDto(
          true,
          data,
          'Success',
          {
            timestamp,
            path: request.url,
            version: 'v1',
          },
        );
      }),
    );
  }
}
