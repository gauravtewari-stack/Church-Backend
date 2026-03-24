import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ApiResponseDto } from '../dto/api-response.dto';

@Injectable()
export class CustomValidationPipe
  extends ValidationPipe
  implements PipeTransform
{
  async transform(value: any, metadata: ArgumentMetadata) {
    if (!metadata.type || metadata.type !== 'body') {
      return value;
    }

    if (!metadata.metatype) {
      return value;
    }

    const object = plainToInstance(metadata.metatype, value, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });

    const errors = await validate(object, {
      skipMissingProperties: false,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,
      skipUndefinedProperties: false,
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      const response = ApiResponseDto.validationError(
        'Validation failed',
        formattedErrors,
      );

      throw new BadRequestException(response);
    }

    return object;
  }

  private formatErrors(
    errors: any[],
  ): Array<{ field: string; message: string }> {
    return errors.flatMap((error) => {
      const messages: Array<{ field: string; message: string }> = [];

      if (error.constraints) {
        Object.entries(error.constraints).forEach(([, message]) => {
          messages.push({
            field: error.property,
            message: String(message),
          });
        });
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        messages.push(
          ...nestedErrors.map((err) => ({
            field: `${error.property}.${err.field}`,
            message: err.message,
          })),
        );
      }

      return messages;
    });
  }
}

/**
 * Standalone validation function for manual validation
 */
@Injectable()
export class ValidatorService {
  async validate<T>(object: T): Promise<string[]> {
    const errors = await validate(object as any);
    return errors.flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }
      return [];
    });
  }

  async validateAndThrow<T>(object: T, message?: string): Promise<void> {
    const errors = await this.validate(object);
    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        data: null,
        message: message || 'Validation failed',
        errors: errors.map((err) => ({
          message: err,
        })),
      });
    }
  }
}
