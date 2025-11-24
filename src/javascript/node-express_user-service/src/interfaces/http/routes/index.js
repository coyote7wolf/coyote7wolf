'use strict';
const express = require('express');
const userRoutes = require('./userRoutes');
const healthRoutes = require('./healthRoutes');

module.exports = function routes() {
  const router = express.Router();
  router.use('/users', userRoutes());
  router.use('/health', healthRoutes());
  return router;
};
