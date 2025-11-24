'use strict';
require('dotenv').config();
const { createApp } = require('./app');
const { buildContainer } = require('./container');
const logger = require('./utils/logger');
const config = require('./config');

const container = buildContainer();
const app = createApp({ container });

const port = config.server.port;
app.listen(port, () => {
  logger.info({ port }, 'Server started');
});
