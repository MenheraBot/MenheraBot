/* eslint-disable @typescript-eslint/ban-ts-comment */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class ReloadSlashCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'reload',
      description: '[DEV] Recarrega algum sistema da Menhera',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'opcao',
          description: 'Sistema para recarregar (comando ou locale [locales])',
          required: true,
        },
      ],
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const opcao = ctx.options.getString('opcao', true).toLowerCase();
    if (opcao === 'locales') {
      // @ts-expect-error Reload command doesnt exist in client<boolean>
      await ctx.client.cluster.broadcastEval((c) => c.reloadLocales());
      ctx.makeMessage({ content: 'Locales Recarregados' });
      return;
    }

    if (!ctx.client.slashCommands.get(opcao)) {
      ctx.makeMessage({ content: 'NAO TEM NENHUM COMANDO COM, ESE NOME' });
      return;
    }

    // TODO: Remove when finish poker
    delete require.cache[require.resolve('../../modules/poker/PokerTable')];

    // @ts-expect-error Reload command doesnt exist in client<boolean>
    await ctx.client.cluster?.broadcastEval((c, { a }) => c.reloadCommand(a), {
      context: { a: opcao },
    });

    await ctx.makeMessage({ content: `${opcao} recarregado com sucesso!` });
  }
}
