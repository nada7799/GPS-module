import Redis from 'ioredis';

// Connect to Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1', // Redis host
  port:  6379, 
});

export { redis };