import { Client } from 'net-ipc';

import { logger } from '../utils/logger';
import { getEnviroments } from '../utils/getEnviroments';

const createIpcConnection = async (): Promise<Client> => {
  const { REST_SOCKET_PATH } = getEnviroments(['REST_SOCKET_PATH']);

  logger.debug(`Creating IPC connection to REST ${REST_SOCKET_PATH}`);

  const restClient = new Client({ path: REST_SOCKET_PATH });

  restClient.on('close', () => {
    logger.info('[REST] REST Client closed');
    process.exit(1);
  });

  restClient.on('ready', () => {
    logger.info('[REST] REST IPC connected');

    restClient.send({ type: 'IDENTIFY', package: 'EVENTS', id: process.pid });
  });

  if (process.env.NODE_ENV === 'test') return restClient;

  await restClient.connect().catch(logger.panic);

  return restClient;
};

export { createIpcConnection };
