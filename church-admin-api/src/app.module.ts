import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Configuration
import { databaseConfig } from './config/database.config';

// Common
import { CommonModule } from './common/common.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { ChurchModule } from './modules/church/church.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SermonsModule } from './modules/sermons/sermons.module';
import { EventsModule } from './modules/events/events.module';
import { DonationsModule } from './modules/donations/donations.module';
import { SpiritualLibraryModule } from './modules/spiritual-library/spiritual-library.module';
import { HymnsModule } from './modules/hymns/hymns.module';
import { RadioModule } from './modules/radio/radio.module';
import { LiveStreamModule } from './modules/live-stream/live-stream.module';
import { MediaModule } from './modules/media/media.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),

    // Database (SQLite for local dev, PostgreSQL for production)
    TypeOrmModule.forRoot(databaseConfig()),

    // Rate limiting / Throttling
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Common module
    CommonModule,

    // Feature modules
    AuthModule,
    ChurchModule,
    UsersModule,
    CategoriesModule,
    SermonsModule,
    EventsModule,
    DonationsModule,
    SpiritualLibraryModule,
    HymnsModule,
    RadioModule,
    LiveStreamModule,
    MediaModule,
    DashboardModule,
    PermissionsModule,
    PublicModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        'api/v1/auth/login',
        'api/v1/auth/register',
        'api/v1/auth/refresh-token',
        'api/v1/auth/forgot-password',
        'api/v1/auth/reset-password',
        'api/v1/public/*path',
        'api/docs/*path',
      )
      .forRoutes('*');
  }
}
