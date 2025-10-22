import { Client } from 'net-ipc';

import { DiscordInteraction } from '@discordeno/bot';
import { bot } from '../index.js';
import { closeConnections } from '../database/databases.js';
import { executeVoteWebhook } from '../utils/executeVoteWebhook.js';
import { getEnviroments } from '../utils/getEnviroments.js';
import { logger } from '../utils/logger.js';
import { updateCommandsOnApi } from '../utils/updateApiCommands.js';
import { getInteractionsCounter, getRegister } from './initializePrometheus.js';
import { clearPokerTimer, startPokerTimeout } from '../modules/poker/timerManager.js';
import cacheRepository from '../database/repositories/cacheRepository.js';
import { getUserAvatar } from '../utils/discord/userUtils.js';
import starsRepository from '../database/repositories/starsRepository.js';
import { postTransaction } from '../utils/apiRequests/statistics.js';
import { ApiTransactionReason } from '../types/api.js';
import notificationRepository from '../database/repositories/notificationRepository.js';

const numberTypeToName = {
  1: 'PING',
  2: 'APPLICATION_COMMAND',
  3: 'MESSAGE_COMPONENT',
  4: 'APPLICATION_COMMAND_AUTOCOMPLETE',
  5: 'MODAL_SUBMIT',
};

const { MENHERA_API_TOKEN } = getEnviroments(['MENHERA_API_TOKEN']);

let retries = 0;
let totalScrapes = 0;

let orchestratorClient: Client;

const getOrchestratorClient = (): Client => orchestratorClient;

const createIpcConnection = async (): Promise<void> => {
  const { ORCHESTRATOR_SOCKET_PATH } = getEnviroments(['ORCHESTRATOR_SOCKET_PATH']);

  logger.debug(`Creating IPC connection to Orchestrator ${ORCHESTRATOR_SOCKET_PATH}`);

  orchestratorClient = new Client({ path: ORCHESTRATOR_SOCKET_PATH });

  orchestratorClient.on('message', async (msg) => {
    if (msg.type === 'INTERACTION_CREATE') {
      if (!process.env.NOMICROSERVICES)
        getInteractionsCounter().inc(
          {
            type: numberTypeToName[msg.data.body.type as 1],
          },
          0.5,
        );

      bot.events.interactionCreate?.(
        bot.transformers.interaction(bot, msg.data.body as DiscordInteraction),
      );
    }

    if (msg.type === 'VOTE_WEBHOOK') {
      logger.logSwitch(bot, 'new vote webhook message', msg);
      executeVoteWebhook(msg.data.user, msg.data.isWeekend);
      return;
    }

    if (msg.type === 'SIMON_SAYS') {
      if (msg.action === 'SET_TIMER') return startPokerTimeout(msg.timerId, msg.timerMetadata);

      return clearPokerTimer(msg.timerId);
    }

    if (msg.type === 'UPDATE_COMMANDS') {
      if (msg.data.token !== MENHERA_API_TOKEN) return;
      updateCommandsOnApi();
      return;
    }

    if (msg.type === 'YOU_MAY_REST') {
      logger.info('[ORCHESTRATOR] I was told to sleep');
      bot.shuttingDown = true;

      logger.info('[SHUTDOWN] Waiting for all commands to finish');
      await new Promise<void>((resolve) => {
        if (bot.commandsInExecution <= 0) return resolve();

        const interval = setInterval(() => {
          if (bot.commandsInExecution <= 0) {
            clearInterval(interval);
            resolve();
            return;
          }
          logger.info(`[SHUTDOWN] There are still ${bot.commandsInExecution} running commands`);
        }, 1_000).unref();
      });

      /* logger.info('[SHUTDOWN] Posting the command execution queue to API');
      await forceBatchCommandsExecutionPost(); */

      logger.info('[SHUTDOWN] Closing all Database connections');
      await closeConnections();

      logger.info('[SHUTDOWN] Closing orchestrator IPC');
      await orchestratorClient.close('REQUESTED_SHUTDOWN');

      logger.info("[SHUTDOWN] I'm tired... I will rest for now");
      console.log('Process waiting to be killed.');
    }
  });

  orchestratorClient.on('request', async (msg, ack) => {
    switch (msg.type) {
      case 'ARE_YOU_OK': {
        ack(Math.floor(process.uptime() * 1000));
        break;
      }
      case 'PROMETHEUS': {
        bot.commandsInExecution += 1;
        const register = getRegister();

        const metrics = await register.metrics();
        ack({ contentType: register.contentType, data: metrics });
        bot.commandsInExecution -= 1;
        totalScrapes += 1;

        if (totalScrapes >= 1000) {
          totalScrapes = 0;
          register.resetMetrics();
        }

        break;
      }
      case 'TELL_ME_USERS': {
        bot.commandsInExecution += 1;
        const result = await Promise.all(
          msg.data.users.map((e: string) => cacheRepository.getDiscordUser(e, false)),
        );

        ack(
          result.map((a, i) =>
            a
              ? {
                  ...a,
                  found: true,
                  id: `${a.id}`,
                  avatar: getUserAvatar(a, { enableGif: true, size: 512 }),
                }
              : { id: `${msg.data.users[i]}`, found: false },
          ),
        );
        bot.commandsInExecution -= 1;
        break;
      }
      case 'THANK_SUGGESTION': {
        const { userId } = msg.data;

        if (!userId) return ack(false);

        await Promise.all([
          starsRepository.addStars(userId as string, 30_000),
          notificationRepository.createNotification(userId, 'commands:menhera.suggest.approved'),
          postTransaction(
            `${bot.applicationId}`,
            userId,
            30_000,
            'estrelinhas',
            ApiTransactionReason.PIX_COMMAND,
          ),
        ]);

        ack(true);

        break;
      }
      case 'YOU_ARE_THE_MASTER': {
        ack(process.pid);
        // @ts-expect-error Ready should not be called with this
        bot.events.ready('MASTER');
        break;
      }
    }
  });

  orchestratorClient.on('close', () => {
    if (bot.shuttingDown) return;

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

  orchestratorClient.on('ready', () => {
    logger.info('[ORCHESTRATOR] Orchestrator IPC connected');
    retries = 0;

    orchestratorClient.send({ type: 'IDENTIFY', version: process.env.VERSION });
  });

  if (process.env.NODE_ENV === 'test') return;

  await orchestratorClient.connect().catch(logger.panic);
};

export { createIpcConnection, getOrchestratorClient };
