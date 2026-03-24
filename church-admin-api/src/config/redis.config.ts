// import { BullModuleOptions } from '@nestjs/bull';
// import { RedisModuleOptions } from '@nestjs/redis';

// Placeholder types since Redis is not available
type BullModuleOptions = any;
type RedisModuleOptions = any;

export const redisConfig = (): RedisModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    enableReadyCheck: true,
    enableOfflineQueue: true,
    socketKeepAlive: true,
    lazyConnect: false,
    connectTimeout: 10000,
    keepAlive: 30000,
    family: 4,
    reconnectOnError: (err: Error) => {
      const targetError = 'READONLY';
      if (err.message.includes(targetError)) {
        return true;
      }
      return false;
    },
    ...(isProduction && {
      tls: {
        rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
      },
    }),
  };
};

export const bullConfig = (): BullModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  return {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_BULL_DB || '1', 10),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    },
    settings: {
      stalledInterval: 5000,
      maxStalledCount: 2,
      lockDuration: 30000,
      lockRenewTime: 15000,
      retryProcessDelay: 5000,
    },
    defaultJobOptions: {
      attempts: parseInt(process.env.BULL_RETRY_ATTEMPTS || '3', 10),
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 3600, // 1 hour
      },
      removeOnFail: false,
    },
  };
};

// Cache queue configuration
export const cacheQueueConfig = (): BullModuleOptions => ({
  ...bullConfig(),
  name: 'cache',
});

// Email queue configuration
export const emailQueueConfig = (): BullModuleOptions => ({
  ...bullConfig(),
  name: 'email',
  defaultJobOptions: {
    ...bullConfig().defaultJobOptions,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 3000,
    },
  },
});

// Notification queue configuration
export const notificationQueueConfig = (): BullModuleOptions => ({
  ...bullConfig(),
  name: 'notification',
});

// Webhook queue configuration
export const webhookQueueConfig = (): BullModuleOptions => ({
  ...bullConfig(),
  name: 'webhook',
  defaultJobOptions: {
    ...bullConfig().defaultJobOptions,
    attempts: 10,
  },
});

// Media processing queue configuration
export const mediaQueueConfig = (): BullModuleOptions => ({
  ...bullConfig(),
  name: 'media',
  defaultJobOptions: {
    ...bullConfig().defaultJobOptions,
    timeout: 300000, // 5 minutes
    attempts: 2,
  },
});

// Report generation queue configuration
export const reportQueueConfig = (): BullModuleOptions => ({
  ...bullConfig(),
  name: 'report',
  defaultJobOptions: {
    ...bullConfig().defaultJobOptions,
    timeout: 600000, // 10 minutes
    attempts: 2,
  },
});
