import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import {
  LoginDto,
  RegisterDto,
  TokenResponseDto,
  ChangePasswordDto,
  UserResponseDto,
} from './dto/auth.dto';
import { UserRole, PermissionAction } from '../../common/enums';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.accessTokenExpiry = this.configService.get<string>('JWT_EXPIRY') || '15m';
    this.refreshTokenExpiry = this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d';
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const { email, password, name, church_id, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcryptjs.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      email,
      password_hash,
      name,
      church_id,
      phone,
      role: UserRole.EDITOR, // Default role
      status: 'active',
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    return this.generateTokens(savedUser);
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || user.status !== 'active') {
      return null;
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<TokenResponseDto> {
    const { email, password } = loginDto;

    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.last_login = new Date().toISOString();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user, ipAddress, userAgent);

    return tokens;
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<TokenResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      church_id: user.church_id,
    };

    // Generate access token
    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.accessTokenExpiry,
    } as any);

    // Generate refresh token
    const refreshTokenValue = this.jwtService.sign(payload, {
      expiresIn: this.refreshTokenExpiry,
    } as any);

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

    // Save refresh token to database
    const refreshToken = this.refreshTokenRepository.create({
      user_id: user.id,
      church_id: user.church_id,
      token: refreshTokenValue,
      expires_at: expiryDate,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Get token expiry in seconds
    const decodedToken = this.jwtService.decode(access_token) as any;
    const expiresIn = decodedToken.exp - decodedToken.iat;

    return {
      access_token,
      refresh_token: refreshTokenValue,
      expires_in: expiresIn,
      token_type: 'Bearer',
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenValue: string): Promise<TokenResponseDto> {
    try {
      const decoded = this.jwtService.verify(refreshTokenValue);

      // Check if refresh token exists in database and is valid
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenValue },
        relations: ['user'],
      });

      if (!storedToken || !storedToken.isValid()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = storedToken.user;

      if (user.status !== 'active') {
        throw new UnauthorizedException('User is inactive');
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { current_password, new_password } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(current_password, user.password_hash);

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    user.password_hash = await bcryptjs.hash(new_password, 10);
    user.updated_by = userId;

    await this.userRepository.save(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToResponseDto(user);
  }

  /**
   * Map User entity to response DTO
   */
  private mapUserToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      church_id: user.church_id,
      status: user.status,
      avatar_url: user.avatar_url,
      phone: user.phone,
      last_login: user.last_login,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  /**
   * Logout by revoking refresh token
   */
  async logout(refreshTokenValue: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshTokenValue },
    });

    if (refreshToken) {
      refreshToken.is_revoked = true;
      await this.refreshTokenRepository.save(refreshToken);
    }
  }
}
