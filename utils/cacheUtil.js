/**
 * In-Memory Cache Utility
 * 
 * Provides lightweight, zero-dependency in-memory caching with:
 * - Time-To-Live (TTL) expiration per entry
 * - Cache stampede / thundering-herd protection via in-flight Promise deduplication
 * - Precise key and prefix-based invalidation
 * - Periodic automatic memory cleanup for expired keys
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
    this.inFlight = new Map();

    // Periodically sweep expired keys every 10 minutes to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.purgeExpired();
    }, 10 * 60 * 1000);

    // Unref timer so it doesn't prevent Node.js from exiting cleanly during tests
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Retrieve a value if it exists and has not expired.
   * @param {string} key
   * @returns {*} cached value or null
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Store a value with a specified TTL in seconds.
   * @param {string} key
   * @param {*} value
   * @param {number} ttlSeconds
   */
  set(key, value, ttlSeconds) {
    const ttlMs = Math.max(ttlSeconds, 1) * 1000;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Invalidate a specific cache key.
   * @param {string} key
   */
  del(key) {
    this.store.delete(key);
    this.inFlight.delete(key);
  }

  /**
   * Invalidate all keys starting with a given prefix.
   * Useful for invalidating groups of related items (e.g. "homes:").
   * @param {string} prefix
   */
  delPrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
    for (const key of this.inFlight.keys()) {
      if (key.startsWith(prefix)) {
        this.inFlight.delete(key);
      }
    }
  }

  /**
   * Stampede-protected get-or-set.
   * If key is cached, returns it immediately.
   * If key is missing or expired, only ONE caller executes fetchFn().
   * Concurrent callers await the same in-flight Promise and share the result.
   *
   * @param {string} key
   * @param {number} ttlSeconds
   * @param {Function} fetchFn async function returning the fresh data
   * @returns {Promise<*>}
   */
  async getOrSet(key, ttlSeconds, fetchFn) {
    const cached = this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    // If another concurrent request is already fetching this key, share its promise
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key);
    }

    // Initiate the single fetch operation
    const fetchPromise = (async () => {
      try {
        const freshData = await fetchFn();
        this.set(key, freshData, ttlSeconds);
        return freshData;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, fetchPromise);
    return fetchPromise;
  }

  /**
   * Purge expired entries from memory.
   */
  purgeExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache.
   */
  flush() {
    this.store.clear();
    this.inFlight.clear();
  }

  /**
   * Return total number of items currently tracked.
   */
  size() {
    return this.store.size;
  }
}

// Export a singleton instance across the application
module.exports = new MemoryCache();
