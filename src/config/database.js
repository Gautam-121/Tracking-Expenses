import { createRequire } from 'module';
import { Sequelize } from 'sequelize';
import env from './env.js';

// Force nft (Vercel's bundler) to include pg in the deployment bundle.
// Sequelize loads pg via dynamic require() which nft cannot trace statically.
// This explicit require pre-loads pg into the CJS cache before Sequelize needs it.
const require = createRequire(import.meta.url);
require('pg');


// Production-grade Sequelize instance with connection pooling, 
const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  timezone: '+00:00', // Enforce UTC
  define: {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
  },
  // Route Sequelize SQL query logs directly to Winston
  //logging: env.NODE_ENV !== 'production' ? (msg) => console.debug(`[Sequelize] ${msg}`) : false,
  logging: false,
  benchmark: env.DB_BENCHMARK,
  pool: {
    max: env.DB_POOL_MAX,
    min: env.DB_POOL_MIN,
    acquire: env.DB_POOL_ACQUIRE,
    idle: env.DB_POOL_IDLE,
    evict: env.DB_POOL_EVICT
  },
  retry: {
    max: env.DB_RETRY_MAX,
    timeout: env.DB_RETRY_TIMEOUT,
    match: [
      /Deadlock/i,
      /Timeout/i,
      /ConnectionError/i,
      /ConnectionRefused/i,
      /Connection terminated/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
    ],
  },
  dialectOptions: {
    application_name: 'inbuild_whatsapp', // For Postgres Monitoring
    statement_timeout: env.DB_STATEMENT_TIMEOUT,
    idle_in_transaction_session_timeout: env.DB_IDLE_TRANSACTION_TIMEOUT,
    connectTimeout: env.DB_CONNECT_TIMEOUT,
    ...(env.DB_SSL || env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {})
  }
});



/**
 * Tests the database connection with exponential backoff.
 * @returns {Promise<boolean>} True if connected, false otherwise.
 */
export const testConnection = async () => {
  let retries = 0;
  const maxRetries = env.DB_RETRY_MAX;
  const backoffBase = env.DB_RETRY_BACKOFF_BASE;
  const backoffExponent = env.DB_RETRY_BACKOFF_EXPONENT;

  while (retries < maxRetries) {
    try {
      console.info(`🔄 Attempting to connect to the database... (Attempt ${retries + 1}/${maxRetries})`);
      await sequelize.authenticate();
      await sequelize.query('SELECT 1'); // Simple query to ensure connection is truly active
      console.info('📦 Database connected successfully.');
      return true;
    } catch (error) {
      retries++;
      console.error(`❌ Database connection attempt ${retries}/${maxRetries} failed: ${error.message}`);

      if (retries === maxRetries) {
        console.error('❌ Maximum connection retries reached.');
        return false;
      }

      const backoffTime = backoffBase * Math.pow(backoffExponent, retries - 1);
      console.info(`⏳ Waiting ${backoffTime}ms before next retry...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  return false;
};

export default sequelize;
