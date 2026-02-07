import { logger } from '../../utils/logger.js';
import { bot } from '../../index.js';
import { createCommand } from '../../structures/command/createCommand.js';
import { executeGracefullShutdown } from '../../internals/gracefullShutdown.js';

const ShutdownCommand = createCommand({
  path: '',
  name: 'shutdown',
  description: '[DEV] Inicia o processo de desligamento da Menhera',
  devsOnly: true,
  category: 'dev',
  authorDataFields: [],
  execute: async (ctx, finishCommand) => {
    bot.shuttingDown = true;

    await ctx.makeMessage({ content: 'Adeus mundo cruel' });
    logger.info('[SHUTDOWN] - Pedido de shutdown via comando');

    finishCommand();
    executeGracefullShutdown(bot);
  },
});

export default ShutdownCommand;
