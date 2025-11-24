'use strict';
const { v4: uuid } = require('uuid');
const User = require('../entities/User');
const { errorCodes } = require('../../constants');

class DomainError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

class UserService {
  constructor({ userRepository, cacheClient, messageQueue, config, logger }) {
    this.userRepository = userRepository;
    this.cache = cacheClient;
    this.queue = messageQueue;
    this.config = config;
    this.logger = logger.child({ module: 'UserService' });
  }

  async createUser({ name, email }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing && !existing.deletedAt) {
      throw new DomainError(errorCodes.CONFLICT, 'Email already exists', 409);
    }
    const user = new User({ id: uuid(), name, email });
    await this.userRepository.create(user);
    await this.cache.set(`user:${user.id}`, user, this.config.cache.ttlSeconds);
    this.queue.publish('user.created', { id: user.id });
    return user;
  }

  async getUser(id) {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;
    const user = await this.userRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new DomainError(errorCodes.NOT_FOUND, 'User not found', 404);
    }
    await this.cache.set(`user:${id}`, user, this.config.cache.ttlSeconds);
    return user;
  }

  async listUsers({ offset = 0, limit = this.config.pagination.defaultLimit }) {
    const safeLimit = Math.min(limit, this.config.pagination.maxLimit);
    const [items, total] = await Promise.all([
      this.userRepository.list({ offset, limit: safeLimit }),
      this.userRepository.count({}),
    ]);
    const filtered = items.filter((u) => !u.deletedAt);
    return { items: filtered, total }; // total includes deleted for transparency
  }

  async updateUser(id, data) {
    const user = await this.userRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new DomainError(errorCodes.NOT_FOUND, 'User not found', 404);
    }
    if (data.email && data.email !== user.email) {
      const existing = await this.userRepository.findByEmail(data.email);
      if (existing && existing.id !== id && !existing.deletedAt) {
        throw new DomainError(errorCodes.CONFLICT, 'Email already exists', 409);
      }
    }
    const updated = await this.userRepository.update(id, data);
    await this.cache.set(`user:${id}`, updated, this.config.cache.ttlSeconds);
    this.queue.publish('user.updated', { id });
    return updated;
  }

  async deleteUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user || user.deletedAt) {
      throw new DomainError(errorCodes.NOT_FOUND, 'User not found', 404);
    }
    await this.userRepository.delete(id);
    await this.cache.del(`user:${id}`);
    this.queue.publish('user.deleted', { id });
  }
}

module.exports = UserService;
