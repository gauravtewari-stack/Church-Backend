import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { UserRole, PermissionAction } from '../../common/enums';

export interface DefaultPermission {
  role: UserRole;
  module: string;
  action: PermissionAction;
  description: string;
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Check if a user has a specific permission
   */
  async checkPermission(
    userId: string,
    churchId: string,
    module: string,
    action: PermissionAction | string,
  ): Promise<boolean> {
    // For now, this is a basic implementation
    // In a production app, you might cache this or use a more sophisticated permission system
    const permission = await this.permissionRepository.findOne({
      where: {
        module,
        action: action as PermissionAction,
        church_id: churchId,
      },
    });

    return !!permission;
  }

  /**
   * Get all permissions for a role
   */
  async getPermissionsByRole(
    role: UserRole,
    churchId: string,
  ): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: {
        role,
        church_id: churchId,
      },
    });
  }

  /**
   * Seed default permissions for a church
   */
  async seedDefaultPermissions(churchId: string): Promise<void> {
    const defaultPermissions = this.getDefaultPermissions();

    for (const perm of defaultPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: {
          role: perm.role,
          module: perm.module,
          action: perm.action,
          church_id: churchId,
        },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          ...perm,
          church_id: churchId,
        });

        await this.permissionRepository.save(permission);
      }
    }
  }

  /**
   * Get default permission structure
   */
  private getDefaultPermissions(): DefaultPermission[] {
    return [
      // Super Admin - Full access
      {
        role: UserRole.SUPER_ADMIN,
        module: 'users',
        action: PermissionAction.CREATE,
        description: 'Create users',
      },
      {
        role: UserRole.SUPER_ADMIN,
        module: 'users',
        action: PermissionAction.READ,
        description: 'Read users',
      },
      {
        role: UserRole.SUPER_ADMIN,
        module: 'users',
        action: PermissionAction.UPDATE,
        description: 'Update users',
      },
      {
        role: UserRole.SUPER_ADMIN,
        module: 'users',
        action: PermissionAction.DELETE,
        description: 'Delete users',
      },

      // Church Admin - Content and user management
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'content',
        action: PermissionAction.CREATE,
        description: 'Create content',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'content',
        action: PermissionAction.READ,
        description: 'Read content',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'content',
        action: PermissionAction.UPDATE,
        description: 'Update content',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'content',
        action: PermissionAction.DELETE,
        description: 'Delete content',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'content',
        action: PermissionAction.PUBLISH,
        description: 'Publish content',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'users',
        action: PermissionAction.READ,
        description: 'Read users',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'users',
        action: PermissionAction.UPDATE,
        description: 'Update users',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'events',
        action: PermissionAction.CREATE,
        description: 'Create events',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'events',
        action: PermissionAction.READ,
        description: 'Read events',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'events',
        action: PermissionAction.UPDATE,
        description: 'Update events',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'events',
        action: PermissionAction.DELETE,
        description: 'Delete events',
      },
      {
        role: UserRole.CHURCH_ADMIN,
        module: 'events',
        action: PermissionAction.PUBLISH,
        description: 'Publish events',
      },

      // Editor - Limited content management
      {
        role: UserRole.EDITOR,
        module: 'content',
        action: PermissionAction.CREATE,
        description: 'Create content',
      },
      {
        role: UserRole.EDITOR,
        module: 'content',
        action: PermissionAction.READ,
        description: 'Read content',
      },
      {
        role: UserRole.EDITOR,
        module: 'content',
        action: PermissionAction.UPDATE,
        description: 'Update content',
      },
      {
        role: UserRole.EDITOR,
        module: 'events',
        action: PermissionAction.READ,
        description: 'Read events',
      },
    ];
  }

  /**
   * Create a custom permission
   */
  async createPermission(
    churchId: string,
    role: UserRole,
    module: string,
    action: PermissionAction,
    description?: string,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({
      church_id: churchId,
      role,
      module,
      action,
      description,
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * Delete a permission
   */
  async deletePermission(
    churchId: string,
    role: UserRole,
    module: string,
    action: PermissionAction,
  ): Promise<boolean> {
    const result = await this.permissionRepository.delete({
      church_id: churchId,
      role,
      module,
      action,
    });

    return result.affected > 0;
  }

  /**
   * Check if role has permission for module action
   */
  async roleHasPermission(
    churchId: string,
    role: UserRole,
    module: string,
    action: PermissionAction,
  ): Promise<boolean> {
    const permission = await this.permissionRepository.findOne({
      where: {
        church_id: churchId,
        role,
        module,
        action,
      },
    });

    return !!permission;
  }
}
