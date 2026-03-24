import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  BadRequestException,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  TokenResponseDto,
  ChangePasswordDto,
  RefreshTokenDto,
  UserResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  /**
   * Login with email and password
   */
  @Post('login')
  @UseGuards(AuthGuard('local'))
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: any,
  ): Promise<TokenResponseDto> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.get('user-agent');

    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  /**
   * Refresh access token
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    if (!refreshTokenDto.refresh_token) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: CurrentUserData): Promise<UserResponseDto> {
    return this.authService.getUserById(user.sub);
  }

  /**
   * Change password
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: CurrentUserData,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(user.sub, changePasswordDto);

    return { message: 'Password changed successfully' };
  }

  /**
   * Logout
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    if (refreshTokenDto.refresh_token) {
      await this.authService.logout(refreshTokenDto.refresh_token);
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Get client IP address from request
   */
  private getClientIp(request: any): string {
    return (
      request.ip ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      request.connection.socket?.remoteAddress ||
      ''
    );
  }
}
