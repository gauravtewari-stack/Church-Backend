import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsPhoneNumber,
  IsBoolean,
  MinLength,
  MaxLength,
  ValidateNested,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SocialLinks } from '../entities/user-profile.entity';

export class SocialLinksDto {
  @ApiPropertyOptional({ description: 'Twitter URL', example: 'https://twitter.com/johndoe' })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({ description: 'Facebook URL' })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'Instagram URL' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Personal website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;
}

export class CreateUserDto {
  @ApiProperty({ description: 'Email address', example: 'john@church.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Bio / about' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+12065551234' })
  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @ApiPropertyOptional({ description: 'Department', example: 'Worship' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Job title', example: 'Worship Leader' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social_links?: SocialLinks;

  @ApiPropertyOptional({ description: 'User role', example: 'editor' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ description: 'Bio' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social_links?: SocialLinks;

  @ApiPropertyOptional({ description: 'Status (active/inactive/suspended)' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class InviteUserDto {
  @ApiProperty({ description: 'Email address', example: 'newuser@church.com' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Full name', example: 'Jane Smith' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Role to assign', example: 'editor' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @ApiPropertyOptional({ description: 'Job title' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}

export class UserProfileDto {
  @ApiProperty() id: string;
  @ApiProperty() user_id: string;
  @ApiProperty() church_id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() bio: string;
  @ApiProperty() avatar_url: string;
  @ApiProperty() phone: string;
  @ApiProperty() department: string;
  @ApiProperty() job_title: string;
  @ApiProperty() social_links: SocialLinks;
  @ApiProperty() status: string;
  @ApiProperty() role: string;
  @ApiProperty() last_login: string;
  @ApiProperty() created_at: Date;
  @ApiProperty() updated_at: Date;
}

export class UserListResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() user_id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() avatar_url: string;
  @ApiProperty() job_title: string;
  @ApiProperty() department: string;
  @ApiProperty() status: string;
  @ApiProperty() role: string;
  @ApiProperty() last_login: string;
  @ApiProperty() created_at: Date;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserListResponseDto] }) data: UserListResponseDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() pages: number;
}

export class UserListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by role' })
  @IsOptional()
  @IsString()
  role?: string;
}

export class BulkAddUsersDto {
  @ApiPropertyOptional({ description: 'List of users to invite', type: [InviteUserDto] })
  @IsOptional()
  users: InviteUserDto[];
}
