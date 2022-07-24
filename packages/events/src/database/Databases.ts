import mongoose from 'mongoose';

import { getEnviroments } from '../utils/getEnviroments';
import { logger } from '../utils/logger';

const initializeMongo = async (): Promise<void> => {
  const { MONGO_URI } = getEnviroments(['MONGO_URI']);

  await mongoose
    .connect(MONGO_URI)
    .catch((e) => logger.panic(`[DATABASE] - Error when connecting to MongoDB: ${e}`))
    .then(() => logger.info('[DATABASE] - MongoDB connected successfully'));
};

export { initializeMongo };
