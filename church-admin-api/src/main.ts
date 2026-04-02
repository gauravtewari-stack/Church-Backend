import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SermonsModule } from './modules/sermons/sermons.module';
import { DonationsModule } from './modules/donations/donations.module';
import { SpiritualLibraryModule } from './modules/spiritual-library/spiritual-library.module';
import { HymnsModule } from './modules/hymns/hymns.module';
import { MediaModule } from './modules/media/media.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  const corsOrigins = (configService.get('CORS_ORIGIN') || 'http://localhost:3000,http://localhost:3001').split(',');
  app.enableCors({
    origin: corsOrigins.map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-API-Key',
      'X-Church-ID',
    ],
    exposedHeaders: [
      'Content-Range',
      'X-Content-Range',
      'X-Total-Count',
      'X-Page-Number',
      'X-Page-Size',
    ],
    optionsSuccessStatus: 200,
    maxAge: 86400,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors
          .map(
            (error) =>
              `${error.property}: ${Object.values(error.constraints || {}).join(', ')}`,
          )
          .join('; ');
        return new BadRequestException(messages);
      },
    }),
  );

  // NOTE: Controllers already include 'api/v1' in their route decorators,
  // so we do NOT set a global prefix here to avoid double-prefixing.

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle(configService.get('API_TITLE') || 'Church Admin Panel API')
    .setDescription(configService.get('API_DESCRIPTION') || 'Complete multi-tenant church administration API')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'Bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'X-Church-ID',
      },
      'X-Church-ID',
    )
    .setContact(
      'Church Admin Support',
      'https://church-admin.com',
      'support@church-admin.com',
    )
    .setExternalDoc(
      'API Documentation',
      'https://docs.church-admin.com',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [
      AuthModule,
      CategoriesModule,
      SermonsModule,
      DonationsModule,
      SpiritualLibraryModule,
      HymnsModule,
      MediaModule,
      DashboardModule,
    ],
  });
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Get port from environment
  const port = configService.get('PORT') || configService.get('APP_PORT') || 3000;
  const nodeEnv = configService.get('NODE_ENV') || 'development';

  // Start server
  await app.listen(port);

  logger.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                   Church Admin API is running!                           ║
║                                                                          ║
║  Environment: ${nodeEnv.padEnd(61)}║
║  Port: ${port.toString().padEnd(66)}║
║  Base URL: http://localhost:${port}/api/v1${''.padEnd(50 - port.toString().length)}║
║  Documentation: http://localhost:${port}/api/docs${''.padEnd(38 - port.toString().length)}║
║                                                                          ║
║  🚀 Server is ready to handle requests!                                  ║
╚══════════════════════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
