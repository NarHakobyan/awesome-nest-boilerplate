import Redis from 'ioredis';

export let redisClient: Redis | null;

function cfnConnectRedis() {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  });

  redisClient = redis;
}

export const cfnConnectAll = async () => {
  cfnConnectRedis();
};
