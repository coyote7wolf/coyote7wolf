'use strict';
const UserRepository = require('../../domain/repositories/UserRepository');

class InMemoryUserRepository extends UserRepository {
  constructor() {
    super();
    this.store = new Map(); // id -> user
  }

  async create(user) {
    this.store.set(user.id, user);
    return user;
  }

  async findById(id) {
    return this.store.get(id) || null;
  }

  async findByEmail(email) {
    for (const user of this.store.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async update(id, data) {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id) {
    const existing = this.store.get(id);
    if (!existing) return;
    existing.deletedAt = new Date();
    existing.updatedAt = new Date();
    this.store.set(id, existing);
  }

  async list({ offset = 0, limit = 20 }) {
    const arr = Array.from(this.store.values()).sort((a, b) => a.createdAt - b.createdAt);
    return arr.slice(offset, offset + limit);
  }

  async count() {
    return this.store.size;
  }
}

module.exports = InMemoryUserRepository;
