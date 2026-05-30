process.env.TZ = 'UTC';

import app from './app.js';
import env from './config/env.js';
import handleShutdown, { onShutdown } from './utils/shutdown.js';
import { testConnection } from './config/database.js';
import { umzug } from './config/umzug.js';
import sequelize from './config/database.js';

process.on('unhandledRejection', (reason) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

const startServer = async () => {
  try {
    onShutdown(async () => {
      console.info('🛑 Closing database connection...');
      await sequelize.close().catch((err) => console.error('Database shutdown error:', err.message));
    });
    
    const isDbConnected = await testConnection();
    if (!isDbConnected) {
      console.error('❌ Database failed to connect. Aborting startup.');
      process.exit(1);
    }

    if (env.DB_RUN_MIGRATIONS_ON_BOOT) {
      const pending = await umzug.pending();
      if (pending.length > 0) {
        console.info(`📋 Applying ${pending.length} pending migration(s)...`);
        await umzug.up();
        console.info('✅ Migrations applied.');
      }
    }

    const server = app.listen(env.PORT, () => {
      console.info(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });

    const shutdownManager = handleShutdown(server);
    process.on('SIGTERM', () => shutdownManager('SIGTERM'));
    process.on('SIGINT',  () => shutdownManager('SIGINT'));

  } catch (error) {
    console.error('❌ CRITICAL FAILURE during startup:', error);
    process.exit(1);
  }
};

startServer();
