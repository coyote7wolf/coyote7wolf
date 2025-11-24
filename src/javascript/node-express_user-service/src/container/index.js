'use strict';
const { createContainer, asClass, asValue } = require('awilix');
const UserService = require('../domain/services/UserService');
const InMemoryUserRepository = require('../infrastructure/persistence/InMemoryUserRepository');
const InMemoryRedisClient = require('../infrastructure/cache/InMemoryRedisClient');
const InMemoryMessageQueue = require('../infrastructure/messaging/InMemoryMessageQueue');
const config = require('../config');
const logger = require('../utils/logger');

function buildContainer() {
  const container = createContainer();
  container.register({
    config: asValue(config),
    logger: asValue(logger),
    userRepository: asClass(InMemoryUserRepository).singleton(),
    cacheClient: asClass(InMemoryRedisClient).singleton(),
    messageQueue: asClass(InMemoryMessageQueue).singleton(),
    userService: asClass(UserService).scoped(),
  });
  return container;
}

module.exports = { buildContainer };
