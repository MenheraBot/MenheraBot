import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import MenheraClient from 'MenheraClient';

export default class ShutdownSlashCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'shutdown',
      description: '[DEV] Começa o processo de desligamento da Menhera',
      category: 'dev',
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const startTime = Date.now();

    ctx.makeMessage({ content: 'A MENHERA VAI DESLIGAAAR' });
    // @ts-expect-error Client é fucker
    await ctx.client.cluster.broadcastEval((c: MenheraClient) => {
      c.shuttingDown = true;
    });
    console.log('[SHTUDOWN] - Todas instâncias postas em ShutDown');

    await ctx.client.jogoDoBichoManager.stopGameLoop();
    console.log('[SHTUDOWN] - Estrelinhas do jogo do Bicho Devolvidas!');
    // @ts-expect-error Client é fucker
    await ctx.client.cluster?.broadcastEval((c: MenheraClient) => c.picassoWs.killConnection());
    console.log('[SHTUDOWN] - Conexões Websockets Picasso fechados');

    console.log('[SHTUDOWN] - Aguardando finalização de comandos');
    await new Promise<void>((resolve) => {
      const interval = setInterval(async () => {
        const cooldowns = (await ctx.client.cluster?.fetchClientValues(
          'commandExecutions.size',
        )) as number[];

        if (cooldowns.reduce((p, c) => p + c, 0) === 0) {
          clearInterval(interval);
          resolve();
        }
      }, 5000);
    });
    console.log('[SHTUDOWN] - Todas execuções de comandos finalizadas!');

    console.log('[SHTUDOWN] - Fechando conexões com o banco de dados');

    // @ts-expect-error Client é fucker
    await ctx.client.cluster?.broadcastEval((c: MenheraClient) => c.database.closeConnections());
    console.log('[SHTUDOWN] - Todas conexões fechadas!');

    console.log(
      `[SHTUDOWN] - Menhera está pronta para desligar! Tempo Total: ${Date.now() - startTime}ms`,
    );
  }
}
