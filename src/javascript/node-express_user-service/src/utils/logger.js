'use strict';
const pino = require('pino');
const config = require('../config');

const logger = pino({ level: config.logging.level || 'info' });

module.exports = logger;
