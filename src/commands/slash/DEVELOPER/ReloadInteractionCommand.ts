import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import LocaleStructure from '@structures/LocaleStructure';

export default class ReloadSlashInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'reload',
      description: 'Recarrega algum comando',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'comando',
          description: 'Comando pra mete em maintenance',
          required: true,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.options.getString('comando', true).toLowerCase() === 'locales') {
      const locale = new LocaleStructure();
      await locale
        .reload()
        .then(() => ctx.replyE('success', 'locales reiniciados! :sparkles:'))
        .catch((e) => ctx.replyE('error', `erro ao reiniciar os locales: ${e.message}`));
      return;
    }

    const command = ctx.options.getString('comando', true).toLowerCase();

    if (!this.client.slashCommands.get(command)) {
      ctx.replyE('error', 'NAO TEM NENHUM COMANDO COM, ESE NOME');
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.client.shard?.broadcastEval((c, { a }) => c.reloadCommand(a), {
      context: { a: command },
    });

    await ctx.replyE('success', `${command} recarregado com sucesso!`);
  }
}
