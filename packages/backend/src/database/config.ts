import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

// Database configuration from environment variables
export const getDatabaseConfig = (): DataSourceOptions => {
  const config: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'enxp',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    logging: process.env.DB_LOGGING === 'true' || false,
    entities: [path.join(__dirname, 'entities/**/*.{ts,js}')],
    migrations: [path.join(__dirname, 'migrations/**/*.{ts,js}')],
    subscribers: [path.join(__dirname, 'subscribers/**/*.{ts,js}')],
    // Connection pool settings
    extra: {
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    },
  };

  return config;
};

// Create DataSource instance
export const AppDataSource = new DataSource(getDatabaseConfig());
