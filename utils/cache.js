const { createClient } = require('redis');
require('dotenv').config();

// Create Redis client with proper TLS handling for Upstash
const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false, // Helps with certain TLS issues
    connectTimeout: 10000, // 10 seconds
    keepAlive: 5000, // Send keep-alive packet every 5 seconds
    noDelay: true // Disable Nagle algorithm
  },
  // Optimize connection settings
  commandsQueueMaxLength: 5000, // Increase queue size for commands
  disableOfflineQueue: false, // Keep queueing commands when disconnected
  // Set reconnect strategy
  reconnectStrategy: (retries) => {
    // Exponential backoff with max delay
    const delay = Math.min(Math.pow(2, retries) * 50, 5000);
    return delay;
  }
});

// Add event listeners for better connection handling
client.on('error', (err) => {
  console.log('Redis Client Error', err);
  // Don't crash the app on Redis errors
});

client.on('connect', () => {
  console.log('Redis client connecting');
});

client.on('ready', () => {
  console.log('Redis client ready and connected');
});

client.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

// Connect to Redis on startup with fallback
(async () => {
  try {
    await client.connect();
    // Pre-warm the connection
    await client.ping();
    console.log('Connected to Redis');
  } catch (err) {
    console.log('Redis connection error - will operate without cache:', err);
    // Continue without Redis if connection fails
  }
})();

// Get data from cache with error handling and timeout
const getCache = async (key) => {
  try {
    if (!client.isOpen) {
      return null;
    }
    
    // Set timeout for Redis operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis operation timed out')), 500);
    });
    
    // Create the Redis get operation
    const redisPromise = client.get(key);
    
    // Race the Redis operation against the timeout
    const data = await Promise.race([redisPromise, timeoutPromise])
      .catch(() => {
        console.log(`Redis get operation timed out for key: ${key}`);
        return null;
      });
      
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null; // Fail silently, return null to trigger database query
  }
};

// Set data in cache with error handling and timeout
const setCache = async (key, data, expiryInSeconds = 300) => {
  try {
    if (!client.isOpen) {
      return false;
    }
    
    // For large objects, don't wait for Redis to complete
    const dataSize = JSON.stringify(data).length;
    const isLargePayload = dataSize > 10000; // 10KB threshold
    
    const cachePromise = client.set(key, JSON.stringify(data), {
      EX: expiryInSeconds
    });
    
    if (isLargePayload) {
      // Don't wait for large payloads to be cached
      cachePromise.catch(err => {
        console.error(`Redis set error for large payload (${dataSize} bytes):`, err);
      });
      return true;
    } else {
      // Wait with timeout for smaller payloads
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Redis set operation timed out')), 500);
      });
      
      await Promise.race([cachePromise, timeoutPromise])
        .catch(() => {
          console.log(`Redis set operation timed out for key: ${key}`);
        });
      
      return true;
    }
  } catch (error) {
    console.error('Redis set error:', error);
    return false; // Fail silently
  }
};

// Delete cache for a key with error handling
const deleteCache = async (key) => {
  try {
    if (!client.isOpen) {
      return false;
    }
    
    // Set timeout for Redis operations
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Redis operation timed out')), 500);
    });
    
    // Create the Redis del operation
    const redisPromise = client.del(key);
    
    // Race the Redis operation against the timeout
    await Promise.race([redisPromise, timeoutPromise])
      .catch(() => {
        console.log(`Redis delete operation timed out for key: ${key}`);
      });
    
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false; // Fail silently
  }
};

// Clear cache by pattern (using SCAN for better performance)
const clearCacheByPattern = async (pattern) => {
  try {
    if (!client.isOpen) {
      return false;
    }
    
    let cursor = 0;
    let keys = [];
    
    // Use scan instead of keys for better performance
    do {
      const result = await client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });
      
      cursor = result.cursor;
      keys = keys.concat(result.keys);
    } while (cursor !== 0);
    
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Cleared ${keys.length} keys matching pattern: ${pattern}`);
    }
    
    return true;
  } catch (error) {
    console.error('Redis pattern clear error:', error);
    return false;
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCacheByPattern
}; 