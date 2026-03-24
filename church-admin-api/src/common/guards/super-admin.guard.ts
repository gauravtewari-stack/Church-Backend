import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    church_id?: string;
  };
}

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Check if user is authenticated
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has super_admin role
    if (request.user.role !== 'super_admin') {
      throw new ForbiddenException('Only super admins can access this resource');
    }

    return true;
  }
}
