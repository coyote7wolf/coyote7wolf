'use strict';
const REQUIRED = ['PORT'];

function loadEnv() {
  const env = process.env;
  REQUIRED.forEach((k) => {
    if (!env[k]) {
      throw new Error(`Missing required env var: ${k}`);
    }
  });
  return {
    nodeEnv: env.NODE_ENV || 'development',
    port: parseInt(env.PORT, 10) || 3000,
    logLevel: env.LOG_LEVEL || 'info',
    requestLog: env.REQUEST_LOG || 'basic',
  };
}

module.exports = loadEnv;
