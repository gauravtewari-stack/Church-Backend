import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'admin@church.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address', example: 'john@church.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (8-50 characters)', example: 'securePass123', minLength: 8, maxLength: 50 })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Church UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  church_id: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIs...' })
  access_token: string;

  @ApiProperty({ description: 'Refresh token', example: 'eyJhbGciOiJIUzI1NiIs...' })
  refresh_token: string;

  @ApiProperty({ description: 'Token expiration time in seconds', example: 86400 })
  expires_in: number;

  @ApiProperty({ description: 'Token type', example: 'Bearer' })
  token_type: string = 'Bearer';
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'oldPassword123' })
  @IsString()
  @MinLength(6)
  current_password: string;

  @ApiProperty({ description: 'New password (8-50 characters)', example: 'newSecurePass456' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  new_password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address for password reset', example: 'admin@church.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password (8-50 characters)', example: 'newSecurePass456' })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  new_password: string;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'Email address', example: 'admin@church.com' })
  email: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  name: string;

  @ApiProperty({ description: 'User role', enum: UserRole, example: 'admin' })
  role: UserRole;

  @ApiProperty({ description: 'Church ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  church_id: string;

  @ApiProperty({ description: 'User status', example: 'active' })
  status: string;

  @ApiProperty({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg' })
  avatar_url: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  phone: string;

  @ApiProperty({ description: 'Last login timestamp' })
  last_login: string;

  @ApiProperty({ description: 'Creation timestamp' })
  created_at: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updated_at: Date;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token to exchange for new access token' })
  @IsString()
  refresh_token: string;
}
