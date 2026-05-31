import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),

  // Database Configuration
  DATABASE_URL: z.string().url(),
  DB_POOL_MAX: z.string().default('10').transform(Number),
  DB_POOL_MIN: z.string().default('2').transform(Number),
  DB_POOL_ACQUIRE: z.string().default('60000').transform(Number),
  DB_POOL_IDLE: z.string().default('20000').transform(Number),
  DB_POOL_EVICT: z.string().default('1000').transform(Number),
  DB_RETRY_MAX: z.string().default('5').transform(Number),
  DB_RETRY_BACKOFF_BASE: z.string().default('1000').transform(Number),
  DB_RETRY_BACKOFF_EXPONENT: z.string().default('1.5').transform(Number),
  DB_RETRY_TIMEOUT: z.string().default('5000').transform(Number),
  DB_STATEMENT_TIMEOUT: z.string().default('5000').transform(Number),
  DB_IDLE_TRANSACTION_TIMEOUT: z.string().default('10000').transform(Number),
  DB_CONNECT_TIMEOUT: z.string().default('5000').transform(Number),
  DB_SSL: z.string().default('false').transform(v => v === 'true'),
  DB_BENCHMARK: z.string().default('true').transform(v => v === 'true'),
  DB_RUN_MIGRATIONS_ON_BOOT: z.string().default('false').transform(v => v === 'true'),
  CORS_ORIGIN: z.string().default('*'),

  // Logging
  LOG_DIR: z.string().optional(),
  LOG_MAX_STRING_LENGTH: z.string().default('1024').transform(Number),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
});


const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
export default env;
