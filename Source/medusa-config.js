const dotenv = require('dotenv');
const { resolve } = require('path');

let ENV_FILE_NAME = '';
switch (process.env.NODE_ENV) {
  case 'production':
    ENV_FILE_NAME = '.env.production';
    break;
  case 'staging':
    ENV_FILE_NAME = '.env.staging';
    break;
  case 'test':
    ENV_FILE_NAME = '.env.test';
    break;
  case 'development':
  default:
    ENV_FILE_NAME = '.env';
    break;
}

try {
  dotenv.config({ path: process.cwd() + '/' + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS = process.env.ADMIN_CORS || 'http://localhost:7000,http://localhost:7001';

const MEDUSA_ADMIN_BACKEND_URL = process.env.MEDUSA_ADMIN_BACKEND_URL || 'http://localhost:9000';

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || 'http://localhost:8000,http://localhost:7001';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://localhost/medusa-starter-default';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    //medusa-file-local
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: 'uploads',
      backend_url: MEDUSA_ADMIN_BACKEND_URL,
    },
  },
  {
    //medusa-admin dashboard
    resolve: '@medusajs/admin',
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      serve: true,
      autoRebuild: true,
      backend: MEDUSA_ADMIN_BACKEND_URL,
      outDir: 'build',
      develop: {
        open: process.env.OPEN_BROWSER !== 'false',
        logLevel: 'error',
        stats: 'normal',
      },
    },
  },
];

const modules = {
  eventBus: {
    resolve: '@medusajs/event-bus-redis',
    options: {
      redisUrl: REDIS_URL,
    },
  },
  cacheService: {
    resolve: '@medusajs/cache-redis',
    options: {
      redisUrl: process.env.CACHE_REDIS_URL,
      ttl: 30,
    },
  },
};

const projectConfig = {
  /** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
  http_compression: {
    enabled: true,
    level: 6,
    memLevel: 8,
    threshold: 1024,
  },

  worker_mode: 'shared',

  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  redis_url: REDIS_URL,
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  projectConfig,
  plugins,
  modules,
  featureFlags: {
    // product_categories: true,
  },
};
