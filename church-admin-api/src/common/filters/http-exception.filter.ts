import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ApiResponseDto } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const exceptionData = exceptionResponse as any;

        message = exceptionData.message || message;
        errors = exceptionData.errors;

        // Handle validation errors from class-validator
        if (Array.isArray(message)) {
          errors = message.map((err: any) =>
            typeof err === 'string'
              ? { message: err }
              : {
                  field: err.property,
                  message: Object.values(err.constraints || {}).join(', '),
                },
          );
          message = 'Validation error';
        }
      }

      this.logger.warn(
        `HTTP Exception: ${status} - ${message} - ${request.url}`,
      );
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;

      if (exception.message.includes('duplicate key')) {
        message = 'Duplicate entry - this record already exists';
      } else if (exception.message.includes('foreign key')) {
        message = 'Invalid reference - the referenced record does not exist';
      } else if (exception.message.includes('violates check')) {
        message = 'Invalid data - constraint violation';
      } else {
        message = 'Database operation failed';
      }

      this.logger.error(
        `Database Error: ${exception.message}`,
        exception.stack,
      );
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unexpected Error: ${exception.message}`,
        exception.stack,
      );
      message = exception.message || 'An unexpected error occurred';
    } else {
      this.logger.error(`Unknown error type`, exception);
    }

    const errorResponse = {
      success: false,
      data: null,
      message,
      errors,
      meta: {
        timestamp,
        path: request.url,
        method: request.method,
        statusCode: status,
      },
    };

    response.status(status).json(errorResponse);
  }
}
