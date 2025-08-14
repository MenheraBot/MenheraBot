import Redis from 'ioredis';
import mongoose from 'mongoose';

import { chooseBasedOnEnv, getEnviroments } from '../utils/getEnviroments';
import { logger } from '../utils/logger';

const { REDIS_PATH } = getEnviroments(['REDIS_PATH']);

const MainRedisClient = new Redis({
  db: chooseBasedOnEnv(0, 1),
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5_000,
  commandTimeout: 3_000,
  path: chooseBasedOnEnv(REDIS_PATH, undefined),
  host: chooseBasedOnEnv(undefined, process.env.REDIS_URL),
});

const VangoghRedisClient = new Redis({
  db: chooseBasedOnEnv(6, 2),
  lazyConnect: true,
  maxRetriesPerRequest: 2,
  connectTimeout: 5_000,
  commandTimeout: 3_000,
  path: chooseBasedOnEnv(REDIS_PATH, undefined),
  host: chooseBasedOnEnv(undefined, process.env.REDIS_URL),
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
