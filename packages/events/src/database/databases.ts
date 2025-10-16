import { Redis } from 'ioredis';
import mongoose from 'mongoose';

import { getEnviroments } from '../utils/getEnviroments.js';
import { logger } from '../utils/logger.js';

const { REDIS_PATH } = getEnviroments(['REDIS_PATH']);

const MainRedisClient = new Redis({
  db: process.env.NODE_ENV === 'development' ? 1 : 0,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5_000,
  commandTimeout: 3_000,
  path: process.env.NODE_ENV === 'production' ? REDIS_PATH : undefined,
  host: process.env.NODE_ENV === 'production' ? undefined : process.env.REDIS_URL,
});

const VangoghRedisClient = new Redis({
  db: process.env.NODE_ENV === 'development' ? 2 : 6,
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5_000,
  commandTimeout: 3_000,
  path: process.env.NODE_ENV === 'production' ? REDIS_PATH : undefined,
  host: process.env.NODE_ENV === 'production' ? undefined : process.env.REDIS_URL,
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
  await MainRedisClient.ping()
    .then(() => logger.info('[DATABASE] - Main redis database connected successfully'))
    .catch((e) =>
      logger.panic(`[DATABASE] - Error when connecting to the main redis database: ${e}`),
    );

  await VangoghRedisClient.ping()
    .then(() => logger.info('[DATABASE] - Vangogh redis database connected successfully'))
    .catch((e) => logger.panic(`[DATABASE] - Error when connecting to Vangogh Redis: ${e}`));
};

const closeConnections = async (): Promise<void> => {
  await MainRedisClient.quit();
  await VangoghRedisClient.quit();
  await mongoose.disconnect();
};

export { initializeMongo, initializeRedis, MainRedisClient, closeConnections, VangoghRedisClient };
