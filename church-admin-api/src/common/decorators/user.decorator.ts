import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface AuthUser {
  id: string;
  role: string;
  church_id?: string;
}

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): AuthUser | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) {
      return undefined;
    }

    // If a specific field is requested, return that field
    if (data) {
      return (request.user as any)[data];
    }

    // Otherwise return the entire user object
    return request.user as AuthUser;
  },
);
