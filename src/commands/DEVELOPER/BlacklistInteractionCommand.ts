import MenheraClient from 'src/MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class BlacklistInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'blacklist',
      description: 'BAN ALGUEM',
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
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const user = ctx.options.getUser('user', true);

    switch (ctx.options.getString('tipo', true)) {
      case 'add': {
        if (!user) {
          await ctx.replyE('error', 'user not found');
          return;
        }
        const reason = ctx.options.getString('motivo', true);

        await this.client.repositories.blacklistRepository.ban(user.id, reason);

        await ctx.replyE('success', 'usuário banido de usar a Menhera!');
        return;
      }
      case 'remove': {
        await this.client.repositories.blacklistRepository.unban(user.id);

        await ctx.replyE('success', 'usuário desbanido');
        return;
      }
      case 'find': {
        if (!user) {
          await ctx.replyE('error', 'user not found');
          return;
        }
        const usr = await this.client.repositories.userRepository.getBannedUserInfo(user.id);
        if (!usr) {
          await ctx.replyE('error', 'Nenhum user');
          return;
        }

        const msg = `== USER BANNED INFO ==\n\n• User :: ${user.tag} - (${user.id})\n• Banned :: ${usr.ban}\n• Reason :: ${usr.banReason}`;
        await ctx.reply(`\`\`\`asciidocmsg\n${msg}\`\`\``);
      }
    }
  }
}
