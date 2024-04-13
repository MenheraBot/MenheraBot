import { Client } from 'net-ipc';

import { DiscordInteraction } from 'discordeno/types';
import { bot } from '..';
import { closeConnections } from '../database/databases';
import { executeVoteWebhook } from '../utils/executeVoteWebhook';
import { getEnviroments } from '../utils/getEnviroments';
import { logger } from '../utils/logger';
import { updateCommandsOnApi } from '../utils/updateApiCommands';
import { getInteractionsCounter, getRegister } from './initializePrometheus';
import cacheRepository from '../database/repositories/cacheRepository';
import { getUserAvatar } from '../utils/discord/userUtils';
import { clearBattleTimer, startBattleTimer } from '../modules/roleplay/battle/battleTimers';
import { clearPokerTimer, startPokerTimeout } from '../modules/poker/timerManager';

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
  if (process.env.NODE_ENV === 'development') return;

  const { ORCHESTRATOR_SOCKET_PATH } = getEnviroments(['ORCHESTRATOR_SOCKET_PATH']);

  logger.debug(`Creating IPC connection to Orchestrator ${ORCHESTRATOR_SOCKET_PATH}`);

  orchestratorClient = new Client({ path: ORCHESTRATOR_SOCKET_PATH });

  orchestratorClient.on('message', async (msg) => {
    if (msg.type === 'VOTE_WEBHOOK') {
      logger.logSwitch(bot, 'new vote webhook message', msg);
      executeVoteWebhook(msg.data.user, msg.data.isWeekend);
      return;
    }

    if (msg.type === 'SIMON_SAYS') {
      const [type, name] = msg.action.split(':') as ['BATTLE' | 'POKER', string];
      const toExecute =
        name === 'CLEAR_TIMER' ? (`${type}_CLEAR` as const) : (`${type}_TIMEOUT` as const);

      const availableFunctions = {
        BATTLE_TIMEOUT: startBattleTimer,
        POKER_TIMEOUT: startPokerTimeout,
        BATTLE_CLEAR: clearBattleTimer,
        POKER_CLEAR: clearPokerTimer,
      };

      return availableFunctions[toExecute](msg.timerId, msg.timerMetadata);
    }

    if (msg.type === 'UPDATE_COMMANDS') {
      if (msg.data.token !== MENHERA_API_TOKEN) return;
      updateCommandsOnApi();
      return;
    }

    if (msg.type === 'YOU_MAY_REST') {
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

      /* logger.info('[SHUTDOWN] Posting the command execution queue to API');
      await forceBatchCommandsExecutionPost(); */

      logger.info('[SHUTDOWN] Closing all Database connections');
      await closeConnections();

      logger.info('[SHUTDOWN] Closing orchestrator IPC');
      await orchestratorClient.close('REQUESTED_SHUTDOWN');

      logger.info("[SHUTDOWN] I'm tired... I will rest for now");
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
      case 'INTERACTION_CREATE': {
        getInteractionsCounter().inc(
          {
            type: numberTypeToName[msg.data.body.type as 1],
          },
          0.5,
        );

        bot.respondInteraction.set((msg.data.body as DiscordInteraction).id, ack);

        bot.events.interactionCreate(
          bot,
          bot.transformers.interaction(bot, msg.data.body as DiscordInteraction),
        );

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
