#!/usr/bin/node
import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Represents a Redis client connection and provides methods for interacting with Redis.
 */
class RedisClient {
  /**
   * Creates a new RedisClient instance and establishes a connection to the Redis server.
   */
  constructor() {
    this.redis = createClient();

    this.redis.on('error', (error) => {
      console.error('Redis connection failed:', error.message || error.toString());
      this.isConnected = false;
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
    });
  }

  /**
   * Checks if the current connection to the Redis server is active.
   * @returns {boolean} True if connected, false otherwise.
   */
  isAlive() {
    return this.isConnected;
  }

  /**
   * Retrieves the value associated with a given key from Redis.
   * @param {string} key The key of the item to retrieve.
   * @returns {Promise<string | object>} Resolves to the retrieved value or null if not found.
   */
  async get(key) {
    const getAsync = promisify(this.redis.GET).bind(this.redis);
    return await getAsync(key);
  }

  /**
   * Stores a key-value pair in Redis with an optional expiration time.
   * @param {string} key The key to associate with the value.
   * @param {string | number | boolean} value The data to store.
   * @param {number} [duration=0] The expiration time in seconds, defaults to no expiration.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async set(key, value, duration = 0) {
    const setExAsync = promisify(this.redis.SETEX).bind(this.redis);
    await setExAsync(key, duration, value);
  }

  /**
   * Removes the value associated with a given key from Redis.
   * @param {string} key The key of the item to remove.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async del(key) {
    const delAsync = promisify(this.redis.DEL).bind(this.redis);
    await delAsync(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
