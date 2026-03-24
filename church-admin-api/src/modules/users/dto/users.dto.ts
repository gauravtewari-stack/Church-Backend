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
import { SocialLinks } from '../entities/user-profile.entity';

export class SocialLinksDto {
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

export class CreateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  last_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social_links?: SocialLinks;

  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatar_url?: string;

  @IsOptional()
  @IsPhoneNumber('US')
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  social_links?: SocialLinks;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class InviteUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  last_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}

export class UserProfileDto {
  id: string;
  user_id: string;
  church_id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  phone: string;
  department: string;
  job_title: string;
  social_links: SocialLinks;
  is_active: boolean;
  role: string;
  last_login_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class UserListResponseDto {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  job_title: string;
  department: string;
  is_active: boolean;
  role: string;
  last_login_at: Date;
  created_at: Date;
}

export class PaginatedUsersDto {
  data: UserListResponseDto[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class UserListQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  is_active?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
}

export class BulkAddUsersDto {
  @IsOptional()
  users: InviteUserDto[];
}
