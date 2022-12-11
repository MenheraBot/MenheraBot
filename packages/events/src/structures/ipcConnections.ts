import { DiscordGatewayPayload } from 'discordeno/types';
import { Client } from 'net-ipc';

import { closeConnections } from '../database/databases';
import { logger } from '../utils/logger';
import { bot } from '../index';
import { getEnviroments } from '../utils/getEnviroments';

let eventsClient: Client;
let retries = 0;

const createIpcConnections = async (): Promise<Client> => {
  const { REST_SOCKET_PATH, EVENT_SOCKET_PATH } = getEnviroments([
    'REST_SOCKET_PATH',
    'EVENT_SOCKET_PATH',
  ]);

  logger.debug(
    `Creating IPC connections to REST ${REST_SOCKET_PATH} and EVENTS ${EVENT_SOCKET_PATH}`,
  );

  const restClient = new Client({ path: REST_SOCKET_PATH });
  eventsClient = new Client({ path: EVENT_SOCKET_PATH });

  eventsClient.on('close', () => {
    logger.info('[GATEWAY] Gateway client closed');

    const reconnectLogic = () => {
      logger.info('[GATEWAY] Trying to reconnect to gateway server');
      eventsClient.connect().catch(() => {
        setTimeout(reconnectLogic, 1000);

        logger.info(`[GATEWAY] Fail when reconnecting... ${retries} retries`);

        if (retries >= 5) {
          logger.info(`[GATEWAY] Couldn't reconnect to gateway server.`);
          process.exit(1);
        }

        retries += 1;
      });
    };

    setTimeout(reconnectLogic, 2000);
  });

  eventsClient.on('ready', () => {
    logger.info('[GATEWAY] Gateway IPC connected');

    eventsClient.send({ type: 'IDENTIFY', version: process.env.VERSION });
  });

  restClient.on('close', () => {
    logger.info('[REST] REST Client closed');
    process.exit(1);
  });

  restClient.on('ready', () => {
    logger.info('[REST] REST IPC connected');

    restClient.send({ type: 'IDENTIFY', package: 'EVENTS', id: process.pid });
  });

  eventsClient.on('message', (msg: { data: DiscordGatewayPayload; shardId: number }) => {
    if (!msg.data.t) return;

    if (msg.data.t !== 'RESUMED') bot.handlers[msg.data.t]?.(bot, msg.data, msg.shardId);
  });

  eventsClient.on('request', async (msg, ack) => {
    switch (msg.type) {
      case 'YOU_ARE_THE_MASTER': {
        ack(process.pid);
        // @ts-expect-error Ready should not be called with this
        bot.events.ready();
        break;
      }
      case 'REQUEST_TO_SHUTDOWN': {
        logger.info('Gateway asked for a shutdown of this instance');
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
        await eventsClient.close('REQUESTED_SHUTDOWN');
        await restClient.close('REQUESTED_SHUTDOWN');
        process.exit(0);
      }
    }
  });

  if (process.env.TESTING) return restClient;

  await restClient.connect().catch(logger.panic);
  await eventsClient.connect().catch(logger.panic);

  return restClient;
};

const getEventsClient = (): Client => eventsClient;

export { createIpcConnections, getEventsClient };
