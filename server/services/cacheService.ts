/**
 * Simple in-memory cache service
 * 
 * Provides caching for expensive API calls with configurable TTL
 */

import { logger } from '../utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static cache = new Map<string, CacheEntry<any>>();

  /**
   * Get cached data if available and not expired
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.ttl) {
      // Cache expired, remove it
      this.cache.delete(key);
      logger.info(`[Cache] Expired: ${key}`);
      return null;
    }

    logger.info(`[Cache] Hit: ${key} (age: ${Math.round(age / 1000)}s)`);
    return entry.data as T;
  }

  /**
   * Set cache data with TTL in milliseconds
   */
  static set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    logger.info(`[Cache] Set: ${key} (TTL: ${Math.round(ttlMs / 1000)}s)`);
  }

  /**
   * Invalidate specific cache key
   */
  static invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logger.info(`[Cache] Invalidated: ${key}`);
    }
  }

  /**
   * Invalidate all cache keys matching a pattern
   */
  static invalidatePattern(pattern: string): void {
    let count = 0;
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    if (count > 0) {
      logger.info(`[Cache] Invalidated ${count} keys matching: ${pattern}`);
    }
  }

  /**
   * Clear all cache
   */
  static clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logger.info(`[Cache] Cleared ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

/**
 * Helper function to wrap async functions with caching
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = CacheService.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  CacheService.set(key, result, ttlMs);
  return result;
}
