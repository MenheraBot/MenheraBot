import { Client } from 'net-ipc';

import { DiscordInteraction } from 'discordeno/types';
import { bot } from '..';
import { closeConnections } from '../database/databases';
import { executeVoteWebhook } from '../utils/executeVoteWebhook';
import { getEnviroments } from '../utils/getEnviroments';
import { logger } from '../utils/logger';
import { updateCommandsOnApi } from '../utils/updateApiCommands';
import { getInteractionsCounter, getRegister } from './initializePrometheus';

const numberTypeToName = {
  1: 'PING',
  2: 'APPLICATION_COMMAND',
  3: 'MESSAGE_COMPONENT',
  4: 'APPLICATION_COMMAND_AUTOCOMPLETE',
  5: 'MODAL_SUBMIT',
};

const { MENHERA_API_TOKEN } = getEnviroments(['MENHERA_API_TOKEN']);

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

  restClient.on('close', (reason) => {
    if (reason === 'REQUESTED_SHUTDOWN') return;

    logger.panic('[REST] REST Client closed');
  });

  orchestratorClient.on('message', (msg) => {
    if (msg.type === 'VOTE_WEBHOOK') {
      executeVoteWebhook(msg.data.user, msg.data.isWeekend);
      return;
    }

    if (msg.type === 'UPDATE_COMMANDS') {
      if (msg.data.token !== MENHERA_API_TOKEN) return;
      updateCommandsOnApi();
      return;
    }

    if (msg.type === 'INTERACTION_CREATE') {
      bot.events.interactionCreate(
        bot,
        bot.transformers.interaction(bot, msg.data.body as DiscordInteraction),
      );

      if (!process.env.NOMICROSERVICES)
        getInteractionsCounter().inc({
          type: numberTypeToName[msg.data.body.type as 1],
        });
    }
  });

  orchestratorClient.on('request', async (msg, ack) => {
    switch (msg.type) {
      case 'PROMETHEUS': {
        bot.commandsInExecution += 1;
        const register = getRegister();

        const metrics = await register.metrics();
        ack({ contentType: register.contentType, data: metrics });
        bot.commandsInExecution -= 1;
        break;
      }
      case 'YOU_ARE_THE_MASTER': {
        ack(process.pid);
        // @ts-expect-error Ready should not be called with this
        bot.events.ready('MASTER');
        break;
      }
      case 'YOU_MAY_REST': {
        logger.info('[ORCHESTRATOR] I was told to sleep');
        bot.shuttingDown = true;

        logger.debug('Waiting for all commands to finish');
        await new Promise<void>((resolve) => {
          if (bot.commandsInExecution <= 0) return resolve();

          const interval = setInterval(() => {
            if (bot.commandsInExecution <= 0) {
              clearInterval(interval);
              resolve();
            }
          }, 3000).unref();
        });

        logger.info('[SHUTDOWN] Closing all Database connections');
        await closeConnections();
        logger.info('[SHUTDOWN] Acked the close to the orchestrator');
        await ack(process.pid);
        logger.info('[SHUTDOWN] Closing rest IPC');
        await restClient.close('REQUESTED_SHUTDOWN');
        logger.info('[SHUTDOWN] Closing orchestrator IPC');
        await orchestratorClient.close('REQUESTED_SHUTDOWN');
        logger.info("[SHUTDOWN] I'm tired... I will rest for now");
      }
    }
  });

  orchestratorClient.on('close', (reason) => {
    logger.info('[ORCHESTRATOR] Lost connection with Orchestrator');

    if (reason === 'REQUESTED_SHUTDOWN') return;

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
