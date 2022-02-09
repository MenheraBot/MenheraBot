import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class BlacklistInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'blacklist',
      description: '[DEV] Manipula os bans da Menhera',
      category: 'dev',
      options: [
        {
          type: 'STRING',
          name: 'tipo',
          description: 'Tipo do comando',
          required: true,
          choices: [
            {
              name: 'Adicionar',
              value: 'add',
            },
            {
              name: 'Remover',
              value: 'remove',
            },
            {
              name: 'Ver',
              value: 'view',
            },
          ],
        },
        {
          type: 'USER',
          name: 'user',
          description: 'Usuario pra banir',
          required: true,
        },
        {
          type: 'STRING',
          name: 'motivo',
          description: 'Motivo do ban',
          required: false,
        },
      ],
      defaultPermission: false,
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    switch (ctx.options.getString('tipo', true)) {
      case 'add': {
        if (!user) {
          await ctx.makeMessage({
            content: 'user not found',
          });
          return;
        }
        const reason = ctx.options.getString('motivo') ?? 'Nenhum motivo informado';

        await ctx.client.repositories.blacklistRepository.ban(user.id, reason);

        await ctx.makeMessage({ content: 'usuário banido de usar a Menhera!' });
        return;
      }
      case 'remove': {
        await ctx.client.repositories.blacklistRepository.unban(user.id);

        await ctx.makeMessage({ content: 'usuário desbanido' });
        return;
      }
      case 'view': {
        if (!user) {
          await ctx.makeMessage({ content: 'user not found' });
          return;
        }
        const usr = await ctx.client.repositories.userRepository.getBannedUserInfo(user.id);
        if (!usr) {
          await ctx.makeMessage({ content: 'Nenhum user' });
          return;
        }

        const msg = `== USER BANNED INFO ==\n\n• User :: ${user.tag} - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;
        await ctx.makeMessage({ content: `\`\`\`asciidocmsg\n${msg}\`\`\`` });
      }
    }
  }
}
