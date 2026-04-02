import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, Not } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  InviteUserDto,
  UserProfileDto,
  UserListResponseDto,
  PaginatedUsersDto,
  UserListQueryDto,
} from './dto/users.dto';

/**
 * Note: This service assumes an Auth module exists with a User entity
 * The actual user creation would happen through the Auth service
 * This service manages the extended UserProfile for church-scoped users
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  /**
   * Create a user profile for a church user
   * Should be called after user is created in auth module
   */
  async createProfile(
    churchId: string,
    userId: string,
    createUserDto: CreateUserDto,
  ): Promise<UserProfileDto> {
    try {
      // Check if profile already exists
      const existing = await this.userProfileRepository.findOne({
        where: { user_id: userId, church_id: churchId },
        withDeleted: true,
      });

      if (existing && !existing.deleted_at) {
        throw new ConflictException('User profile already exists');
      }

      const profile = this.userProfileRepository.create({
        user_id: userId,
        church_id: churchId,
        name: createUserDto.name,
        bio: createUserDto.bio,
        avatar_url: createUserDto.avatar_url,
        phone: createUserDto.phone,
        department: createUserDto.department,
        job_title: createUserDto.job_title,
        social_links: createUserDto.social_links || {},
        status: 'active',
      });

      const saved = await this.userProfileRepository.save(profile);
      return this.mapToDto(saved);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user profile');
    }
  }

  /**
   * Get a user profile by ID
   */
  async findOne(profileId: string, churchId: string): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          id: profileId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      return this.mapToDto(profile);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * Get user profile by user_id and church_id
   */
  async findByUserId(
    userId: string,
    churchId: string,
  ): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          user_id: userId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      return this.mapToDto(profile);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  /**
   * List all users for a church with pagination and filters
   */
  async findAllByChurch(
    churchId: string,
    query: UserListQueryDto,
  ): Promise<PaginatedUsersDto> {
    try {
      const page = Math.max(query.page || 1, 1);
      const limit = Math.min(Math.max(query.limit || 20, 1), 100);
      const skip = (page - 1) * limit;

      const where: any = { church_id: churchId, deleted_at: IsNull() };

      if (query.search) {
        where.name = Like(`%${query.search}%`);
      }

      if (query.status) {
        where.status = query.status;
      }

      const [profiles, total] = await this.userProfileRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: { created_at: 'DESC' },
        relations: ['church'],
      });

      const data = profiles.map((profile) => this.mapToListDto(profile));
      const pages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        pages,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  /**
   * Update user profile
   */
  async update(
    profileId: string,
    churchId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          id: profileId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      Object.assign(profile, updateUserDto);
      const updated = await this.userProfileRepository.save(profile);

      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  /**
   * Invite a user to the church
   * This method prepares the invitation but actual user creation happens in auth module
   */
  async inviteUser(
    churchId: string,
    inviteUserDto: InviteUserDto,
  ): Promise<{ invitation_token: string; message: string }> {
    try {
      // TODO: Implement invitation workflow with auth module
      // This would typically involve:
      // 1. Creating an invitation record
      // 2. Generating an invitation token
      // 3. Sending an email with invitation link
      // 4. Token expires after 7 days

      const invitationToken = this.generateInvitationToken();

      return {
        invitation_token: invitationToken,
        message: `Invitation sent to ${inviteUserDto.email}`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to invite user');
    }
  }

  /**
   * Soft delete a user profile
   */
  async softDelete(
    profileId: string,
    churchId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          id: profileId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      await this.userProfileRepository.softDelete(profileId);

      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  /**
   * Restore a soft-deleted user
   */
  async restore(
    profileId: string,
    churchId: string,
  ): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          id: profileId,
          church_id: churchId,
          deleted_at: Not(IsNull()),
        },
        withDeleted: true,
      });

      if (!profile) {
        throw new NotFoundException('User not found or is not deleted');
      }

      await this.userProfileRepository.restore(profileId);
      const restored = await this.userProfileRepository.findOne({
        where: { id: profileId },
      });

      return this.mapToDto(restored);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore user');
    }
  }

  /**
   * Deactivate a user
   */
  async deactivate(
    profileId: string,
    churchId: string,
  ): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          id: profileId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      profile.status = 'inactive';
      const updated = await this.userProfileRepository.save(profile);

      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to deactivate user');
    }
  }

  /**
   * Activate a user
   */
  async activate(
    profileId: string,
    churchId: string,
  ): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          id: profileId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      profile.status = 'active';
      const updated = await this.userProfileRepository.save(profile);

      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to activate user');
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(
    userId: string,
    churchId: string,
  ): Promise<UserProfileDto> {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: {
          user_id: userId,
          church_id: churchId,
          deleted_at: IsNull(),
        },
      });

      if (!profile) {
        throw new NotFoundException('User not found');
      }

      profile.last_login = new Date().toISOString();
      const updated = await this.userProfileRepository.save(profile);

      return this.mapToDto(updated);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update last login');
    }
  }

  /**
   * Check if user exists in church
   */
  async userExistsInChurch(userId: string, churchId: string): Promise<boolean> {
    const profile = await this.userProfileRepository.findOne({
      where: {
        user_id: userId,
        church_id: churchId,
        deleted_at: IsNull(),
      },
    });
    return !!profile;
  }

  /**
   * Get count of active users in church
   */
  async getActiveUserCount(churchId: string): Promise<number> {
    return this.userProfileRepository.count({
      where: {
        church_id: churchId,
        status: 'active',
        deleted_at: IsNull(),
      },
    });
  }

  /**
   * Generate invitation token
   */
  private generateInvitationToken(): string {
    return Buffer.from(
      `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    ).toString('base64');
  }

  /**
   * Map user profile to DTO
   */
  private mapToDto(profile: UserProfile): UserProfileDto {
    return {
      id: profile.id,
      user_id: profile.user_id,
      church_id: profile.church_id,
      name: profile.name,
      email: '', // Email would come from auth User entity
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      phone: profile.phone,
      department: profile.department,
      job_title: profile.job_title,
      social_links: profile.social_links,
      status: profile.status,
      role: '', // Role would come from auth User entity
      last_login: profile.last_login,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };
  }

  /**
   * Map user profile to list response DTO
   */
  private mapToListDto(profile: UserProfile): UserListResponseDto {
    return {
      id: profile.id,
      user_id: profile.user_id,
      name: profile.name,
      email: '', // Email would come from auth User entity
      avatar_url: profile.avatar_url,
      job_title: profile.job_title,
      department: profile.department,
      status: profile.status,
      role: '', // Role would come from auth User entity
      last_login: profile.last_login,
      created_at: profile.created_at,
    };
  }
}
