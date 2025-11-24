'use strict';
const loadEnv = require('./env');

const env = loadEnv();

module.exports = {
  env: env.nodeEnv,
  server: {
    port: env.port,
  },
  logging: {
    level: env.logLevel,
    request: env.requestLog,
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  cache: {
    ttlSeconds: 60,
  },
};
