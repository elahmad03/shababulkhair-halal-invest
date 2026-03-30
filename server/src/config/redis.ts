import Redis from 'ioredis';
import { env } from '.';
const isProd = env.NODE_ENV === 'production';
const redisClient = new Redis({
  host: env.REDIS_HOST || 'localhost',
  port: env.REDIS_PORT || 6379,
  username: isProd ? 'default' : undefined,
  password: env.REDIS_PASSWORD,
  tls: isProd ? {} : undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

export default redisClient;