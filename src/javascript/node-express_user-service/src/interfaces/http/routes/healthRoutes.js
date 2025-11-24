'use strict';
const express = require('express');
const healthController = require('../controllers/healthController');

module.exports = function healthRoutes() {
  const router = express.Router();
  router.get('/', healthController.liveness);
  return router;
};
