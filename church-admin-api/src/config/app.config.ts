export const appConfig = {
  // Server configuration
  port: parseInt(process.env.APP_PORT || '3000', 10),
  host: process.env.APP_HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',

  // API configuration
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',

  // CORS configuration
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
    skip: (req: any) => process.env.NODE_ENV === 'test',
  },

  // Global request timeout
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10),

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100,
    minLimit: 1,
  },

  // File upload configuration
  fileUpload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    maxFiles: parseInt(process.env.MAX_FILES || '10', 10),
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'audio/mpeg',
      'audio/wav',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },

  // Security headers
  securityHeaders: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // Swagger documentation
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    path: '/api/docs',
    title: 'Church Admin Panel API',
    description: 'RESTful API for Church Administration System',
    version: '1.0.0',
    contact: {
      name: 'Church Admin Support',
      url: 'https://church-admin.com',
      email: 'support@church-admin.com',
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Cache configuration
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '600', 10), // 10 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000', 10),
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFile: process.env.LOG_FILE === 'true',
    logDir: process.env.LOG_DIR || './logs',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },

  // Feature flags
  features: {
    enableAuditLog: process.env.FEATURE_AUDIT_LOG !== 'false',
    enableNotifications: process.env.FEATURE_NOTIFICATIONS !== 'false',
    enableEmailQueue: process.env.FEATURE_EMAIL_QUEUE !== 'false',
    enableWebhooks: process.env.FEATURE_WEBHOOKS !== 'false',
  },
};

export type AppConfig = typeof appConfig;
