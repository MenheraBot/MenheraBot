/* eslint-disable @typescript-eslint/ban-ts-comment */
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class ReloadSlashInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'reload',
      description: 'Recarrega algum comando',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'opcao',
          description: 'Comando pra mete em maintenance',
          required: true,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 5,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const opcao = ctx.options.getString('opcao', true).toLowerCase();
    if (opcao === 'locales') {
      // @ts-expect-error Reload command doesnt exist in client<boolean>
      await ctx.client.shard?.broadcastEval((c) => c.reloadLocales());
      ctx.makeMessage({ content: 'Locales Recarregados' });
      return;
    }

    if (!ctx.client.slashCommands.get(opcao)) {
      ctx.makeMessage({ content: 'NAO TEM NENHUM COMANDO COM, ESE NOME' });
      return;
    }

    // @ts-expect-error Reload command doesnt exist in client<boolean>
    await ctx.client.shard?.broadcastEval((c, { a }) => c.reloadCommand(a), {
      context: { a: opcao },
    });

    await ctx.makeMessage({ content: `${opcao} recarregado com sucesso!` });
  }
}
