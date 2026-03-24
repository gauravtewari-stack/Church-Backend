import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  last_name: string;

  @IsUUID()
  church_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class TokenResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string = 'Bearer';
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  current_password: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  new_password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  new_password: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  church_id: string;
  is_active: boolean;
  avatar_url: string;
  phone: string;
  last_login_at: Date;
  created_at: Date;
  updated_at: Date;
}

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}
