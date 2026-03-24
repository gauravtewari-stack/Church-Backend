import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    church_id?: string;
  };
  params: {
    id?: string | string[];
  };
}

@Injectable()
export class ChurchGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Check if user has church_id
    if (!request.user?.church_id && request.user?.role !== 'super_admin') {
      throw new BadRequestException('User must be associated with a church');
    }

    // For requests with a specific church ID in params, verify access
    const churchIdParam = request.params?.id;
    if (
      churchIdParam &&
      request.user?.role !== 'super_admin' &&
      request.user?.church_id !== churchIdParam
    ) {
      throw new ForbiddenException(
        'You do not have access to this church resource',
      );
    }

    return true;
  }
}
