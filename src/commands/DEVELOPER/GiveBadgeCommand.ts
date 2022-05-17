import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';

export default class GiveBadgeSlashCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'givebadge',
      description: '[DEV] Dá uma Badge pra alguém',
      category: 'dev',
      options: [
        {
          name: 'user',
          description: 'User pra da badge',
          type: 'USER',
          required: true,
        },
        {
          name: 'badgeid',
          description: 'id da badge',
          type: 'INTEGER',
          autocomplete: true,
          required: true,
        },
      ],
      devsOnly: true,
      cooldown: 1,
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    const { id: userId } = ctx.options.getUser('user', true);
    const badgeId = ctx.options.getInteger('badgeid', true);

    const userBadges = await ctx.client.repositories.badgeRepository.getBadges(userId);

    if (!userBadges) {
      ctx.makeMessage({
        content: ctx.prettyResponseText('error', 'Este usuário não possui uma conta na Menher'),
      });
      return;
    }

    if (userBadges.badges.some((a) => a.id === badgeId)) {
      ctx.makeMessage({
        content: ctx.prettyResponseText('error', 'Este usuário já possui esta badge!'),
      });
      return;
    }

    await ctx.client.repositories.badgeRepository.addBadge(userId, badgeId);

    await ctx.makeMessage({
      content: ctx.prettyResponseText('success', 'Badge Adicionada ao usuário'),
    });
  }
}
