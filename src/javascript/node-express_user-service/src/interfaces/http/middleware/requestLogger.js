'use strict';
const config = require('../../../config');
const logger = require('../../../utils/logger');

module.exports = function requestLogger() {
  if (config.logging.request === 'none') return (_req, _res, next) => next();
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const ms = Date.now() - start;
      logger.info(
        { method: req.method, url: req.originalUrl, status: res.statusCode, ms },
        'request',
      );
    });
    next();
  };
};
