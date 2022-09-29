import { logger } from '../../utils/logger';
import { closeConnections } from '../../database/databases';
import { stopGame } from '../../modules/bicho/bichoManager';
import { bot } from '../../index';
import { createCommand } from '../../structures/command/createCommand';

const ShutdownCommand = createCommand({
  path: '',
  name: 'shutdown',
  description: '[DEV] Inicia o processo de desligamento da Menhera',
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx) => {
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

    await stopGame();
    registerStep('Estrelinhas do jogo do bicho devolvidas!');

    await new Promise<void>((resolve) => {
      if (bot.commandsInExecution <= 1) return resolve();

      const interval = setInterval(() => {
        if (bot.commandsInExecution <= 1) {
          clearInterval(interval);
          resolve();
        }
      }, 3000);
    });

    registerStep('Todas execuções de comandos finalizadas!');

    await closeConnections();

    registerStep('Conexões com os bancos de dados fechadas!');

    // Maybe send messages to REST and GATEWAY process to warn the downtime

    ctx.followUp({
      content: `${toSendMessage}\n\nA Menhera está pronta para desligar! Tempo total: ${
        Date.now() - startTime
      }ms`,
    });

    logger.info('[SHUTDOWN] - Menhera está pronta para desligar!');
  },
});

export default ShutdownCommand;
