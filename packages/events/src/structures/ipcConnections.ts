import { Client } from 'net-ipc';

import { bot } from '..';
import { closeConnections } from '../database/databases';
import { getEnviroments } from '../utils/getEnviroments';
import { logger } from '../utils/logger';

let retries = 0;

const createIpcConnections = async (): Promise<Client> => {
  const { REST_SOCKET_PATH, ORCHESTRATOR_SOCKET_PATH } = getEnviroments([
    'REST_SOCKET_PATH',
    'ORCHESTRATOR_SOCKET_PATH',
  ]);

  logger.debug(`Creating IPC connection to REST ${REST_SOCKET_PATH}`);

  const restClient = new Client({ path: REST_SOCKET_PATH });

  logger.debug(`Creating IPC connection to Orchestrator ${REST_SOCKET_PATH}`);

  const orchestratorClient = new Client({ path: ORCHESTRATOR_SOCKET_PATH });

  restClient.on('close', () => {
    logger.panic('[REST] REST Client closed');
  });

  orchestratorClient.on('request', async (msg, ack) => {
    switch (msg.type) {
      case 'YOU_ARE_THE_MASTER': {
        ack(process.pid);
        // @ts-expect-error Ready should not be called with this
        bot.events.ready('MASTER');
        break;
      }
      case 'YOU_MAY_REST': {
        logger.info('[ORCHESTRATOR] I am going to sleep now');
        bot.shuttingDown = true;

        await new Promise<void>((resolve) => {
          if (bot.commandsInExecution <= 0) return resolve();

          const interval = setInterval(() => {
            if (bot.commandsInExecution <= 0) {
              clearInterval(interval);
              resolve();
            }
          }, 3000).unref();
        });

        await closeConnections();
        await ack(process.pid);
        await orchestratorClient.close('REQUESTED_SHUTDOWN');
        await restClient.close('REQUESTED_SHUTDOWN');
        process.exit(0);
      }
    }
  });

  orchestratorClient.on('close', () => {
    logger.info('[ORCHESTRATOR] Lost connection with Orchestrator');

    const reconnectLogic = () => {
      logger.info('[ORCHESTRATOR] Trying to reconnect to orchestrator server');
      orchestratorClient.connect().catch(() => {
        setTimeout(reconnectLogic, 500);

        retries += 1;

        logger.error(`[ORCHESTRATOR] Fail when reconnecting... ${retries} retry`);

        if (retries >= 5) logger.panic(`[ORCHESTRATOR] Couldn't reconnect to orchestrator server.`);
      });
    };

    setTimeout(reconnectLogic, 1000);
  });

  restClient.on('ready', () => {
    logger.info('[REST] REST IPC connected');

    restClient.send({ type: 'IDENTIFY' });
  });

  orchestratorClient.on('ready', () => {
    logger.info('[ORCHESTRATOR] Orchestrator IPC connected');
    retries = 0;

    orchestratorClient.send({ type: 'IDENTIFY', version: process.env.VERSION });
  });

  if (process.env.NODE_ENV === 'test') return restClient;

  await restClient.connect().catch(logger.panic);
  await orchestratorClient.connect().catch(logger.panic);

  return restClient;
};

export { createIpcConnections };
