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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@Controller('api/v1/users')
@UseGuards(AuthenticatedGuard, ChurchGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user in the church' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserProfileDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.createProfile(user.church_id, '', createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users in the church' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: PaginatedUsersDto })
  async findAll(
    @Query(ValidationPipe) query: UserListQueryDto,
    @User() user: AuthUser,
  ): Promise<PaginatedUsersDto> {
    return this.usersService.findAllByChurch(user.church_id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserProfileDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.findOne(id, user.church_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserProfileDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.update(id, user.church_id, updateUserDto);
  }

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a user to the church' })
  @ApiResponse({ status: 201, description: 'Invitation sent successfully' })
  async invite(
    @Body(ValidationPipe) inviteUserDto: InviteUserDto,
    @User() user: AuthUser,
  ): Promise<{ invitation_token: string; message: string }> {
    return this.usersService.inviteUser(user.church_id, inviteUserDto);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a user' })
  @ApiResponse({ status: 200, description: 'User deactivated', type: UserProfileDto })
  async deactivate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.deactivate(id, user.church_id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a user' })
  @ApiResponse({ status: 200, description: 'User activated', type: UserProfileDto })
  async activate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.activate(id, user.church_id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async softDelete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<{ success: boolean; message: string }> {
    return this.usersService.softDelete(id, user.church_id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted user' })
  @ApiResponse({ status: 200, description: 'User restored', type: UserProfileDto })
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
    @User() user: AuthUser,
  ): Promise<UserProfileDto> {
    return this.usersService.restore(id, user.church_id);
  }
}
