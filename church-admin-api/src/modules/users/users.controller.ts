import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  InviteUserDto,
  UserProfileDto,
  UserListResponseDto,
  PaginatedUsersDto,
  UserListQueryDto,
} from './dto/users.dto';
import { AuthenticatedGuard } from '../../common/guards/authenticated.guard';
import { ChurchGuard } from '../../common/guards/church.guard';
import { User } from '../../common/decorators/user.decorator';
import { CurrentChurch } from '../../common/decorators/current-church.decorator';

interface AuthUser {
  id: string;
  role: string;
  church_id: string;
}

interface ChurchContext {
  id: string;
}

@Controller('api/v1/users')
@UseGuards(AuthenticatedGuard, ChurchGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user profile in the church
   * POST /api/v1/users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    // TODO: Verify user has permission to create users (admin/pastor role)
    return this.usersService.createProfile(user.church_id, '', createUserDto);
  }

  /**
   * Get all users in the church
   * GET /api/v1/users
   */
  @Get()
  async findAll(
    @Query(ValidationPipe) query: UserListQueryDto,
    @User() user: AuthUser,
  ): Promise<PaginatedUsersDto> {
    return this.usersService.findAllByChurch(user.church_id, query);
  }

  /**
   * Get a specific user by ID
   * GET /api/v1/users/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.findOne(id, user.church_id);
  }

  /**
   * Update user profile
   * PATCH /api/v1/users/:id
   */
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    // TODO: Verify user has permission (own profile or admin)
    return this.usersService.update(id, user.church_id, updateUserDto);
  }

  /**
   * Invite a user to the church
   * POST /api/v1/users/invite
   */
  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  async invite(
    @Body(ValidationPipe) inviteUserDto: InviteUserDto,
    @User() user: AuthUser,
  ): Promise<{ invitation_token: string; message: string }> {
    // TODO: Verify user has permission to invite (admin/pastor role)
    return this.usersService.inviteUser(user.church_id, inviteUserDto);
  }

  /**
   * Deactivate a user
   * POST /api/v1/users/:id/deactivate
   */
  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    // TODO: Verify user has permission (admin only)
    return this.usersService.deactivate(id, user.church_id);
  }

  /**
   * Activate a user
   * POST /api/v1/users/:id/activate
   */
  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    // TODO: Verify user has permission (admin only)
    return this.usersService.activate(id, user.church_id);
  }

  /**
   * Soft delete a user
   * DELETE /api/v1/users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async softDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<{ success: boolean; message: string }> {
    // TODO: Verify user has permission (admin only)
    return this.usersService.softDelete(id, user.church_id);
  }

  /**
   * Restore a soft-deleted user
   * POST /api/v1/users/:id/restore
   */
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    // TODO: Verify user has permission (admin only)
    return this.usersService.restore(id, user.church_id);
  }
}
