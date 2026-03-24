import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionRequirement } from '../decorators/permissions.decorator';
import { UserRole } from '../enums';

export interface PermissionsService {
  checkPermission(
    userId: string,
    churchId: string,
    module: string,
    action: string,
  ): Promise<boolean>;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject('PERMISSIONS_SERVICE')
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    // Super admin has access to everything
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Check each required permission
    for (const permission of requiredPermissions) {
      const hasPermission = await this.permissionsService.checkPermission(
        user.sub,
        user.church_id,
        permission.module,
        permission.action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `User does not have permission to ${permission.action} ${permission.module}`,
        );
      }
    }

    return true;
  }
}
