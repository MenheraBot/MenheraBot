/* eslint-disable @typescript-eslint/ban-ts-comment */
import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

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
      await this.client.shard?.broadcastEval(async () => {
        const LocaleStructure = (await import('@structures/LocaleStructure')).default;
        const locale = new LocaleStructure();
        locale.reload();
      });
    }

    const command = ctx.options.getString('comando', true).toLowerCase();

    if (!this.client.slashCommands.get(command)) {
      ctx.replyE('error', 'NAO TEM NENHUM COMANDO COM, ESE NOME');
    }

    // @ts-ignore
    await this.client.shard?.broadcastEval((c, { a }) => c.reloadCommand(a), {
      context: { a: command },
    });

    await ctx.replyE('success', `${command} recarregado com sucesso!`);
  }
}
