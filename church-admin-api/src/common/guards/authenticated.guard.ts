import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if user is authenticated
    // This assumes the auth middleware has already validated the JWT
    // and attached the user to the request
    if (!request.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return true;
  }
}
