import Redis from 'ioredis';
import mongoose from 'mongoose';

import { getEnviroments } from '../utils/getEnviroments';
import { logger } from '../utils/logger';

// eslint-disable-next-line import/no-mutable-exports
const RedisClient = new Redis({
  db: process.env.NODE_ENV === 'development' ? 1 : 0,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5_000,
  commandTimeout: 3_000,
});

const initializeMongo = async (): Promise<void> => {
  const { MONGO_URI } = getEnviroments(['MONGO_URI']);

  await mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5_000,
    })
    .catch((e) => logger.panic(`[DATABASE] - Error when connecting to MongoDB: ${e}`))
    .then(() => logger.info('[DATABASE] - MongoDB connected successfully'));
};

const initializeRedis = async (): Promise<void> => {
  await RedisClient.ping()
    .then(() => logger.info('[DATABASE] - Redis connected successfully'))
    .catch((e) => logger.panic(`[DATABASE] - Error when connecting to Redis: ${e}`));
};

export { initializeMongo, initializeRedis, RedisClient };
