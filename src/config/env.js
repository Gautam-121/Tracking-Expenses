import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database Configuration
  DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z.string().transform(Number).default('10'),
  DB_POOL_MIN: z.string().transform(Number).default('2'),
  DB_POOL_ACQUIRE: z.string().transform(Number).default('60000'),
  DB_POOL_IDLE: z.string().transform(Number).default('20000'),
  DB_POOL_EVICT: z.string().transform(Number).default('1000'),
  DB_RETRY_MAX: z.string().transform(Number).default('5'),
  DB_RETRY_BACKOFF_BASE: z.string().transform(Number).default('1000'),
  DB_RETRY_BACKOFF_EXPONENT: z.string().transform(Number).default('1.5'),
  DB_RETRY_TIMEOUT: z.string().transform(Number).default('5000'),
  DB_STATEMENT_TIMEOUT: z.string().transform(Number).default('5000'),
  DB_IDLE_TRANSACTION_TIMEOUT: z.string().transform(Number).default('10000'),
  DB_CONNECT_TIMEOUT: z.string().transform(Number).default('5000'),
  DB_SSL: z.string().transform(v => v === 'true').default('false'),
  DB_BENCHMARK: z.string().transform(v => v === 'true').default('true'),
  DB_RUN_MIGRATIONS_ON_BOOT: z.string().transform(v => v === 'true').default('false'),
  CORS_ORIGIN: z.string().default('*'),

  // Logging
  LOG_DIR: z.string().optional(),
  LOG_MAX_STRING_LENGTH: z.string().transform(Number).default('1024'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});


const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
export default env;
