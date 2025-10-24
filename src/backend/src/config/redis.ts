import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Create Redis client
export const createRedisClient = () => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError: (err) => {
      console.error('Redis connection error:', err);
      return true;
    },
  });

  client.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  client.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  client.on('close', () => {
    console.log('Redis connection closed');
  });

  return client;
};

// Default Redis client instance
export const redisClient = createRedisClient();

// Test connection
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    await redisClient.ping();
    console.log('✅ Redis ping successful');
    return true;
  } catch (error) {
    console.error('❌ Redis ping failed:', error);
    return false;
  }
};
