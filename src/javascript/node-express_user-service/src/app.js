'use strict';
const express = require('express');
const routes = require('./interfaces/http/routes');
const requestLogger = require('./interfaces/http/middleware/requestLogger');
const notFound = require('./interfaces/http/middleware/notFound');
const errorHandler = require('./interfaces/http/middleware/errorHandler');

function createApp({ container }) {
  const app = express();
  app.set('container', container);
  app.use(express.json());
  app.use(requestLogger());

  app.use('/api/v1', routes());

  app.use(notFound());
  app.use(errorHandler());
  return app;
}

module.exports = { createApp };
