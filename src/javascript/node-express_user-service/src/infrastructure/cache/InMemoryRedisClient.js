'use strict';
class InMemoryRedisClient {
  constructor() {
    this.cache = new Map(); // key -> { value, expires }
  }

  async set(key, value, ttlSeconds = 60) {
    const expires = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expires });
  }

  async get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key) {
    this.cache.delete(key);
  }

  async flush() {
    this.cache.clear();
  }
}

module.exports = InMemoryRedisClient;
