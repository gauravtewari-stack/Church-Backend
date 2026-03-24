import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface ChurchContext {
  id: string;
}

export const CurrentChurch = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): ChurchContext | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // Try to get church ID from user
    if ((request.user as any)?.church_id) {
      return { id: (request.user as any).church_id };
    }

    // Try to get church ID from params
    if (request.params?.id) {
      const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
      return { id };
    }

    return undefined;
  },
);
