import { Umzug, SequelizeStorage } from 'umzug';
import sequelize from './database.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Production-grade Umzug configuration for running migrations
 * safely in an ES Modules environment.
 */
export const umzug = new Umzug({
  migrations: {
    glob: ['../migrations/*.js', { cwd: __dirname }],
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  console: {
    info: msg => console.info(`[Umzug] ${JSON.stringify(msg)}`),
    warn: msg => console.warn(`[Umzug] ${JSON.stringify(msg)}`),
    error: msg => console.error(`[Umzug] ${JSON.stringify(msg)}`),
    debug: msg => console.debug(`[Umzug] ${JSON.stringify(msg)}`)
  },
});

// Run as CLI if executed directly (e.g., via `npm run migrate`)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  umzug.runAsCLI().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
}
