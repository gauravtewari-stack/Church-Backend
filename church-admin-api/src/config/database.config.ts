import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const dbType = (process.env.DB_TYPE as any) || 'better-sqlite3';

  // SQLite config for local development
  if (dbType === 'better-sqlite3' || dbType === 'sqlite') {
    return {
      type: 'better-sqlite3',
      database: process.env.DB_PATH || path.join(__dirname, '../../church_admin.sqlite'),
      entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
      synchronize: true,
      logging: process.env.DB_LOGGING === 'true',
    };
  }

  // PostgreSQL config for production
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'church_admin',
    entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    subscribers: [path.join(__dirname, '../**/*.subscriber{.ts,.js}')],
    migrations: [path.join(__dirname, '../migrations/**/*{.ts,.js}')],
    synchronize: !isProduction,
    logging: process.env.DB_LOGGING === 'true' || !isProduction,
    logger: 'advanced-console',
    maxQueryExecutionTime: parseInt(process.env.DB_QUERY_TIMEOUT || '5000', 10),
    poolSize: parseInt(process.env.DB_POOL_SIZE || '20', 10),
    ...(isProduction && {
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    }),
    migrationsRun: false,
    migrationsTransactionMode: 'each',
    extra: {
      max: parseInt(process.env.DB_POOL_SIZE || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  };
};
