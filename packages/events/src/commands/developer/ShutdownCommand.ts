import { logger } from '../../utils/logger';
import { closeConnections } from '../../database/databases';
import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';

const ShutdownCommand = createCommand({
  path: '',
  name: 'shutdown',
  description: '[DEV] Inicia o processo de desligamento da Menhera',
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    const startTime = Date.now();
    bot.shuttingDown = true;

    await ctx.makeMessage({ content: 'Iniciando o processo de desligamento' });

    let referenceTime = Date.now();
    let toSendMessage = '';

    const registerStep = (message: string) => {
      const duration = Date.now() - referenceTime;
      referenceTime = Date.now();

      toSendMessage += `[${duration}ms] - ${message}\n`;
    };

    await new Promise<void>((resolve) => {
      if (bot.commandsInExecution <= 1) return resolve();

      const interval = setInterval(() => {
        if (bot.commandsInExecution <= 1) {
          clearInterval(interval);
          resolve();
        }
      }, 3000).unref();
    });

    registerStep('Todas execuções de comandos finalizadas!');

    await closeConnections();

    registerStep('Conexões com os bancos de dados fechadas!');

    ctx.followUp({
      content: `${toSendMessage}\n\nA Menhera está pronta para desligar! Tempo total: ${
        Date.now() - startTime
      }ms`,
    });

    logger.info('[SHUTDOWN] - Menhera está pronta para desligar!');
    finishCommand();
  },
});

export default ShutdownCommand;
