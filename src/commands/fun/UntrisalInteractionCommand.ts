import InteractionCommand from '@structures/command/InteractionCommand';
import InteractionCommandContext from '@structures/command/InteractionContext';
import { MessageButton } from 'discord.js-light';
import Util from '@utils/Util';

export default class UntrisalInteractionCommand extends InteractionCommand {
  constructor() {
    super({
      name: 'untrisal',
      description: '「🛑」・Termina o seu trisal',
      category: 'fun',
      cooldown: 5,
      clientPermissions: ['EMBED_LINKS'],
      authorDataFields: ['trisal'],
    });
  }

  async run(ctx: InteractionCommandContext): Promise<void> {
    if (ctx.data.user.trisal?.length === 0) {
      await ctx.makeMessage({ content: ctx.prettyResponse('error', 'error'), ephemeral: true });
      return;
    }

    const button = new MessageButton()
      .setStyle('SUCCESS')
      .setCustomId(ctx.interaction.id)
      .setLabel(ctx.translate('confirm'));

    await ctx.makeMessage({
      content: ctx.prettyResponse('question', 'sure'),
      components: [{ type: 'ACTION_ROW', components: [button] }],
    });

    const confirmed = await Util.collectComponentInteractionWithId(
      ctx.channel,
      ctx.author.id,
      ctx.interaction.id,
      15000,
    );

    if (!confirmed) {
      ctx.makeMessage({
        components: [
          {
            type: 1,
            components: [button.setDisabled(true).setLabel(ctx.locale('common:timesup'))],
          },
        ],
      });
      return;
    }

    await ctx.client.repositories.relationshipRepository.untrisal(
      ctx.author.id,
      ctx.data.user.trisal[0],
      ctx.data.user.trisal[1],
    );
    ctx.makeMessage({
      content: ctx.prettyResponse('success', 'done'),
      components: [
        { type: 'ACTION_ROW', components: [button.setDisabled(true).setStyle('PRIMARY')] },
      ],
    });
  }
}
