import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '../enums';

export const PERMISSIONS_KEY = 'permissions';

export interface PermissionRequirement {
  module: string;
  action: PermissionAction;
}

export const RequirePermissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
