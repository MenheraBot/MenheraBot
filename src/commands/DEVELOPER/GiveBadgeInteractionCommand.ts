import MenheraClient from 'MenheraClient';
import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class GiveBadgeSlashInteractionCommand extends InteractionCommand {
  constructor(client: MenheraClient) {
    super(client, {
      name: 'givebadge',
      description: 'da badge',
      category: 'dev',
      options: [
        {
          type: 'USER',
          name: 'user',
          description: 'User pra da badge',
          required: true,
        },
        {
          name: 'badgeid',
          description: 'id da badge',
          type: 'INTEGER',
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
    await this.client.repositories.badgeRepository.addBadge(
      ctx.options.getUser('user', true).id,
      ctx.options.getInteger('badgeid', true),
    );

    await ctx.reply('Concluido');
  }
}
