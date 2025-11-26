import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";

/**
 * Cacheable Decorator for ElasticsearchService
 * Implements caching strategy for search results with TTL
 *
 * Usage:
 * @Cacheable({ key: 'search-vector-{{ vector }}-{{ k }}', ttl: 900 })
 * async vectorSearch(vector: number[], k: number) { ... }
 */
export interface CacheableOptions {
  key?: string;
  ttl?: number; // seconds
}

/**
 * Generate cache key from method name and parameters
 */
function generateCacheKey(methodName: string, args: any[]): string {
  const argKey = args
    .map((arg) => {
      if (typeof arg === "object") {
        return JSON.stringify(arg).substring(0, 50); // Truncate large objects
      }
      return String(arg).substring(0, 50);
    })
    .join("-");

  return `${methodName}:${argKey}`;
}

/**
 * Cacheable Decorator
 * Caches method results with TTL expiration
 *
 * Caching Strategy:
 * - Vector search results: 15 minutes (900s) - stable embeddings
 * - Full-text search results: 10 minutes (600s) - moderate volatility
 * - Hybrid search results: 10 minutes (600s) - combined results
 * - Phrase search results: 20 minutes (1200s) - less frequent changes
 * - Prefix search results: 5 minutes (300s) - high volatility
 * - Index stats: 5 minutes (300s) - updates periodically
 */
export function Cacheable(options: CacheableOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`Cacheable[${propertyKey}]`);

    (descriptor as any).value = async function (...args: any[]) {
      // Inject cache manager
      const cacheManager =
        (this as any).cacheManager || (this as any)[CACHE_MANAGER];

      if (!cacheManager) {
        logger.warn("Cache manager not available, executing without cache");
        return originalMethod.apply(this, args);
      }

      // Generate cache key
      const cacheKey = options.key || generateCacheKey(propertyKey, args);

      try {
        // Try to get from cache
        const cachedValue = await cacheManager.get(cacheKey);

        if (cachedValue !== undefined) {
          logger.debug(`Cache HIT for key: ${cacheKey}`);
          return cachedValue;
        }
      } catch (error) {
        logger.warn(`Cache retrieval failed for key: ${cacheKey}`, error);
        // Continue to execute method if cache fails
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store result in cache
      try {
        const ttl = options.ttl || 600; // Default 10 minutes
        await cacheManager.set(cacheKey, result, ttl * 1000); // Convert to milliseconds
        logger.debug(`Cache SET for key: ${cacheKey} with TTL: ${ttl}s`);
      } catch (error) {
        logger.warn(`Cache storage failed for key: ${cacheKey}`, error);
        // Still return result even if cache fails
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache Invalidation Decorator
 * Removes specific keys from cache on method execution
 *
 * Usage:
 * @CacheInvalidate(['search-vector-*', 'search-fulltext-*'])
 * async indexDocument(indexName: string, id: string, body: any) { ... }
 */
export function CacheInvalidate(keyPatterns: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const logger = new Logger(`CacheInvalidate[${propertyKey}]`);

    (descriptor as any).value = async function (...args: any[]) {
      // Execute original method first
      const result = await originalMethod.apply(this, args);

      // Invalidate cache
      try {
        const cacheManager =
          (this as any).cacheManager || (this as any)[CACHE_MANAGER];

        if (cacheManager) {
          for (const pattern of keyPatterns) {
            try {
              // Simple pattern matching (not full glob support)
              if (pattern.includes("*")) {
                // For Redis store, use pattern matching
                if (
                  cacheManager.store &&
                  typeof cacheManager.store.keys === "function"
                ) {
                  const keys = await cacheManager.store.keys(`${pattern}`);
                  for (const key of keys) {
                    await cacheManager.del(key);
                  }
                  logger.debug(
                    `Invalidated ${keys.length} keys matching pattern: ${pattern}`
                  );
                }
              } else {
                // Exact key
                await cacheManager.del(pattern);
                logger.debug(`Invalidated cache key: ${pattern}`);
              }
            } catch (error) {
              logger.warn(`Failed to invalidate pattern: ${pattern}`, error);
            }
          }
        }
      } catch (error) {
        logger.warn("Cache invalidation failed", error);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Caching Configuration
 * Define TTL policies for different search types
 */
export const CACHE_TTL_CONFIG = {
  VECTOR_SEARCH: {
    key: "search:vector",
    ttl: 15 * 60, // 15 minutes (900s)
    description: "向量搜尋結果 - 穩定的 embeddings",
  },
  FULLTEXT_SEARCH: {
    key: "search:fulltext",
    ttl: 10 * 60, // 10 minutes (600s)
    description: "全文搜尋結果 - 中等波動性",
  },
  HYBRID_SEARCH: {
    key: "search:hybrid",
    ttl: 10 * 60, // 10 minutes (600s)
    description: "混合搜尋結果 - 組合結果",
  },
  PHRASE_SEARCH: {
    key: "search:phrase",
    ttl: 20 * 60, // 20 minutes (1200s)
    description: "短語搜尋結果 - 變化較少",
  },
  PREFIX_SEARCH: {
    key: "search:prefix",
    ttl: 5 * 60, // 5 minutes (300s)
    description: "前綴搜尋結果 - 高波動性",
  },
  INDEX_STATS: {
    key: "stats:index",
    ttl: 5 * 60, // 5 minutes (300s)
    description: "索引統計 - 定期更新",
  },
  CLUSTER_STATS: {
    key: "stats:cluster",
    ttl: 5 * 60, // 5 minutes (300s)
    description: "集群統計 - 定期更新",
  },
};

/**
 * Cache Invalidation Patterns
 * Keys to invalidate when documents are modified
 */
export const CACHE_INVALIDATION_PATTERNS = {
  ON_INDEX_DOCUMENT: [
    "search:vector:*",
    "search:fulltext:*",
    "search:hybrid:*",
    "search:phrase:*",
    "search:prefix:*",
    "stats:index:*",
  ],
  ON_DELETE_DOCUMENT: [
    "search:vector:*",
    "search:fulltext:*",
    "search:hybrid:*",
    "search:phrase:*",
    "search:prefix:*",
    "stats:index:*",
    "stats:cluster:*",
  ],
  ON_BULK_INDEX: [
    "search:vector:*",
    "search:fulltext:*",
    "search:hybrid:*",
    "search:phrase:*",
    "search:prefix:*",
    "stats:index:*",
    "stats:cluster:*",
  ],
  ON_CLEAR_INDEX: ["search:*", "stats:*"],
};

/**
 * Cache Key Builder
 * Utility to build consistent cache keys
 */
export class CacheKeyBuilder {
  static vectorSearch(vector: number[], k: number, filters?: any): string {
    const vectorHash = Math.abs(vector.reduce((a, b) => a + b, 0));
    const filterKey = filters ? JSON.stringify(filters).substring(0, 20) : "";
    return `search:vector:${vectorHash}-${k}-${filterKey}`;
  }

  static fulltextSearch(
    query: string,
    fields?: string[],
    limit?: number,
    offset?: number
  ): string {
    const fieldKey = fields ? fields.join(",") : "all";
    return `search:fulltext:${query}-${fieldKey}-${limit}-${offset}`;
  }

  static phraseSearch(
    phrase: string,
    fields?: string[],
    limit?: number,
    slop?: number
  ): string {
    const fieldKey = fields ? fields.join(",") : "all";
    return `search:phrase:${phrase}-${fieldKey}-${limit}-${slop}`;
  }

  static prefixSearch(field: string, prefix: string, limit?: number): string {
    return `search:prefix:${field}-${prefix}-${limit}`;
  }

  static hybridSearch(
    vector: number[],
    query: string,
    weights?: any,
    k?: number,
    filters?: any
  ): string {
    const vectorHash = Math.abs(vector.reduce((a, b) => a + b, 0));
    const weightKey = weights ? JSON.stringify(weights).substring(0, 20) : "";
    const filterKey = filters ? JSON.stringify(filters).substring(0, 20) : "";
    return `search:hybrid:${vectorHash}-${query}-${weightKey}-${k}-${filterKey}`;
  }

  static indexStats(indexName: string): string {
    return `stats:index:${indexName}`;
  }

  static clusterStats(): string {
    return `stats:cluster:root`;
  }
}
