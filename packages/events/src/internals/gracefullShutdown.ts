import { closeConnections } from '../database/databases.js';
import { getOrchestratorClient } from '../structures/orchestratorConnection.js';
import { MenheraClient } from '../types/menhera.js';
import { logger } from '../utils/logger.js';

const executeGracefullShutdown = async (bot: MenheraClient) => {
  bot.shuttingDown = true;

  const forceExit = setTimeout(() => {
    console.error('[SHUTDOWN] STALLED SHUTDOWN PROCESS. KILLING IT NOW');
    process.exit(1);
  }, 10000).unref();

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
  await getOrchestratorClient().close('REQUESTED_SHUTDOWN');

  logger.info("[SHUTDOWN] I'm tired... I will rest for now");
  clearTimeout(forceExit);
  process.exit(0);
};

const setupSignalHandlers = (bot: MenheraClient) => {
  ['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach((sig) =>
    process.on(sig, () => {
      logger.info("[SHUTDOWN] Received shutdown signal")
      executeGracefullShutdown(bot)
    } )
  );
};

export { executeGracefullShutdown, setupSignalHandlers };
