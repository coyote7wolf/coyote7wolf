import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly defaultTTL = 3600; // 1 hour in seconds

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      // Continue without Redis for development
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch (error) {
      console.error("Failed to disconnect from Redis:", error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.client.isOpen) {
        console.warn("Redis client not connected, returning null");
        return null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Redis GET error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        console.warn("Redis client not connected, skipping SET");
        return false;
      }

      const serializedValue = JSON.stringify(value);
      const result = await this.client.setEx(
        key,
        ttl || this.defaultTTL,
        serializedValue
      );
      return result === "OK";
    } catch (error) {
      console.error("Redis SET error:", error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        console.warn("Redis client not connected, skipping DEL");
        return false;
      }

      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error("Redis DEL error:", error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        console.warn("Redis client not connected, returning false");
        return false;
      }

      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      return false;
    }
  }

  async setSessionData(
    sessionId: string,
    data: any,
    ttl?: number
  ): Promise<boolean> {
    return this.set(`session:${sessionId}`, data, ttl);
  }

  async getSessionData<T>(sessionId: string): Promise<T | null> {
    return this.get<T>(`session:${sessionId}`);
  }

  async setTaskResult(
    taskId: string,
    result: any,
    ttl?: number
  ): Promise<boolean> {
    return this.set(`task:${taskId}`, result, ttl);
  }

  async getTaskResult<T>(taskId: string): Promise<T | null> {
    return this.get<T>(`task:${taskId}`);
  }

  async setUserContext(
    userId: string,
    context: any,
    ttl?: number
  ): Promise<boolean> {
    return this.set(`user:${userId}:context`, context, ttl);
  }

  async getUserContext<T>(userId: string): Promise<T | null> {
    return this.get<T>(`user:${userId}:context`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        return false;
      }

      const result = await this.client.ping();
      return result === "PONG";
    } catch (error) {
      console.error("Redis health check failed:", error);
      return false;
    }
  }
}
