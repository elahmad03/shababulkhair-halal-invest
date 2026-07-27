import Redis from 'ioredis';
import { env } from '.';

const isProd = env.NODE_ENV === 'production';
const useTLS = env.REDIS_TLS === true; 

const baseOptions = {
  host: env.REDIS_HOST || 'localhost',
  port: env.REDIS_PORT || 6379,
  username: useTLS ? 'default' : undefined,
  password: env.REDIS_PASSWORD,
  tls: useTLS ? {} : undefined,
  retryStrategy(times: number) {
    const maxRetries = 20;
    if (times > maxRetries) return null;
    return Math.min(times * 50, 2000);
  },
};

const redisClient = new Redis({
  ...baseOptions,
  maxRetriesPerRequest: 3,
});

export const bullmqRedis = new Redis({
  ...baseOptions,
  maxRetriesPerRequest: null,
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err) => console.error('❌ Redis error:', err));

bullmqRedis.on('connect', () => console.log('✅ BullMQ Redis connected'));
bullmqRedis.on('error', (err) => console.error('❌ BullMQ Redis error:', err));

export default redisClient;